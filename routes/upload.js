const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Helper function to extract product name from campaign
function extractProductFromCampaign(campaignName) {
  if (!campaignName) return 'Unknown Product';
  // Extract product name from "ProductName - Platform - GEO" format
  return campaignName.split(' - ')[0].trim();
}

// Helper function to extract platform from campaign name
function extractPlatformFromCampaign(campaignName) {
  if (!campaignName) return 'unknown';
  const parts = campaignName.split(' - ');
  return parts.length > 1 ? parts[1].trim().toLowerCase() : 'unknown';
}

// Helper function to safely parse numbers
function parseNumber(value) {
  if (!value) return 0;
  const cleaned = String(value).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Helper function to get column value with multiple possible names
function getColumnValue(row, possibleNames) {
  for (const name of possibleNames) {
    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
      return row[name];
    }
  }
  return '';
}

// Enhanced CSV upload with COD business logic
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError) {
      return res.status(401).json({ error: authError.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { platform } = req.body;
    if (!platform || !['facebook', 'tiktok', 'google'].includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform specified' });
    }

    const csvData = [];
    const stream = Readable.from(req.file.buffer.toString());

    // Parse CSV
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (row) => {
          csvData.push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    if (csvData.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty or invalid' });
    }

    console.log(`Processing ${csvData.length} rows from ${platform} CSV`);

    // Process CSV data with enhanced COD mapping
    const processedData = csvData.map(row => {
      const campaignName = getColumnValue(row, [
        'Campaign name', 'Campaign Name', 'campaign_name', 'Campaign'
      ]);

      const productName = extractProductFromCampaign(campaignName);
      const extractedPlatform = extractPlatformFromCampaign(campaignName) || platform;

      return {
        user_id: user.id,
        file_name: req.file.originalname,
        platform: extractedPlatform,
        campaign_name: campaignName,
        product_name: productName,
        product_extracted: productName,
        campaign_date: new Date().toISOString().split('T')[0], // Today's date
        
        // Enhanced metrics mapping for COD - Updated for Facebook columns
        amount_spent: parseNumber(getColumnValue(row, [
          'Campaign Amount spent (', 'Amount spent (CAD)', 'Amount Spent', 'Spend', 'Cost', 'Amount spent'
        ])),
        
        revenue: parseNumber(getColumnValue(row, [
          'Purchase ROAS (return on ad spend)', 'Revenue', 'Purchase Value', 
          'Conversion Value', 'Conv. value'
        ])),
        
        // Map clicks to leads - Updated for Facebook columns
        leads: parseNumber(getColumnValue(row, [
          'Unique link clicks', 'Link clicks', 'Clicks', 'Link Clicks', 'Leads'
        ])),
        
        conversions: parseNumber(getColumnValue(row, [
          'Results', 'Purchases', 'Conversions', 'Orders'
        ])),
        
        reach: parseNumber(getColumnValue(row, [
          'Reach', 'Unique Reach'
        ])),
        
        impressions: parseNumber(getColumnValue(row, [
          'Impressio', 'Impressions', 'Impr.'
        ])),
        
        // These will be manually entered later
        confirmed_leads: 0,
        delivered_orders: 0,
        
        raw_data: row
      };
    });

    // Insert raw campaign data first
    const { data: insertedCampaigns, error: insertError } = await supabase
      .from('campaign_reports')
      .insert(processedData)
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      return res.status(500).json({ error: 'Failed to save campaign data to database' });
    }

    // Aggregate into daily stats (upsert based on date + campaign)
    const dailyStats = {};
    
    processedData.forEach(row => {
      const key = `${row.campaign_name}|${row.campaign_date}`;
      
      if (!dailyStats[key]) {
        dailyStats[key] = {
          user_id: user.id,
          campaign_name: row.campaign_name,
          product_name: row.product_name,
          platform: row.platform,
          date: row.campaign_date,
          amount_spent: 0,
          reach: 0,
          impressions: 0,
          leads: 0,
          confirmed_leads: 0,
          delivered_orders: 0,
          revenue: 0
        };
      }
      
      // Sum up metrics for the day
      dailyStats[key].amount_spent += row.amount_spent;
      dailyStats[key].reach += row.reach;
      dailyStats[key].impressions += row.impressions;
      dailyStats[key].leads += row.leads;
      dailyStats[key].revenue += row.revenue;
    });

    // Upsert daily stats
    const dailyStatsArray = Object.values(dailyStats);
    
    for (const stat of dailyStatsArray) {
      const { error: upsertError } = await supabase
        .from('campaign_daily_stats')
        .upsert(stat, { 
          onConflict: 'user_id,campaign_name,date',
          ignoreDuplicates: false 
        });
        
      if (upsertError) {
        console.error('Daily stats upsert error:', upsertError);
      }
    }

    // Auto-create products if they don't exist
    const uniqueProducts = [...new Set(processedData.map(row => row.product_name))];
    
    for (const productName of uniqueProducts) {
      // Check if product exists
      const { data: existingProduct, error: productCheckError } = await supabase
        .from('products')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_name', productName)
        .single();

      if (productCheckError && productCheckError.code === 'PGRST116') {
        // Product doesn't exist, create it
        const { data: newProduct, error: createError } = await supabase
          .from('products')
          .insert({
            user_id: user.id,
            product_name: productName,
            revenue_per_conversion: 0 // Will be updated manually
          })
          .select()
          .single();

        if (createError) {
          console.error(`Error creating product ${productName}:`, createError);
        } else {
          console.log(`Auto-created product: ${productName}`);
          
          // Create corresponding product metrics entry
          const { error: metricsError } = await supabase
            .from('product_metrics')
            .insert({
              user_id: user.id,
              product_id: newProduct.id,
              unit_cost: 0,
              selling_price: 0,
              units_delivered: 0,
              stock_purchased: 0
            });
            
          if (metricsError) {
            console.error(`Error creating product metrics for ${productName}:`, metricsError);
          }
        }
      }
    }

    // Create upload history record
    const { error: historyError } = await supabase
      .from('upload_history')
      .insert({
        user_id: user.id,
        file_name: req.file.originalname,
        platform: platform,
        rows_processed: processedData.length,
        status: 'completed'
      });

    if (historyError) {
      console.error('History error:', historyError);
    }

    res.json({
      message: 'File uploaded and processed successfully',
      rowsProcessed: processedData.length,
      dailyStatsCreated: dailyStatsArray.length,
      productsProcessed: uniqueProducts.length,
      data: insertedCampaigns?.slice(0, 5) // Return first 5 rows as sample
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;