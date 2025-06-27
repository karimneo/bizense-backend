const express = require('express');
const router = express.Router();
const { supabaseAuthClient, supabaseServiceClient } = require('../config/supabase');
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

// Upload CSV file
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error: authError } = await supabaseAuthClient.auth.getUser(token);
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

    // Enhanced duplicate prevention - check existing campaign data
    console.log('🔍 ENHANCED DUPLICATE CHECKING...');
    
    // IMMEDIATE CHECK: Any upload with same filename in last 10 minutes is blocked
    const existingUploads = await supabaseServiceClient
      .from('upload_history')
      .select('*')
      .eq('user_id', user.id)
      .eq('file_name', req.file.originalname)
      .eq('platform', platform)
      .order('upload_date', { ascending: false })
      .limit(1);

    if (existingUploads.data && existingUploads.data.length > 0) {
      const lastUpload = existingUploads.data[0];
      const lastUploadTime = new Date(lastUpload.upload_date || lastUpload.created_at);
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000); // Increased to 10 minutes
      
      console.log('⚠️  FOUND PREVIOUS UPLOAD:');
      console.log(`   File: ${req.file.originalname}`);
      console.log(`   Last uploaded: ${lastUploadTime.toISOString()}`);
      console.log(`   Time difference: ${Math.round((Date.now() - lastUploadTime.getTime()) / 1000)} seconds ago`);
      
      if (lastUploadTime > tenMinutesAgo) {
        return res.status(400).json({ 
          error: '🚫 DUPLICATE UPLOAD BLOCKED', 
          details: `File "${req.file.originalname}" was already uploaded ${Math.round((Date.now() - lastUploadTime.getTime()) / 1000)} seconds ago.`,
          suggestion: 'Wait 10 minutes before uploading the same file again, or rename your file if this is genuinely new data.',
          timestamp: lastUploadTime.toISOString()
        });
      }
    }

    const csvData = [];
    const stream = Readable.from(req.file.buffer.toString());

    // Parse CSV first to check content
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

    const parseNumber = (value) => {
      if (!value) return 0;
      const cleaned = String(value).replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    };

    const getColumnValue = (row, possibleNames) => {
      for (const name of possibleNames) {
        if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
          return row[name];
        }
      }
      return '';
    };

    const extractProductName = (campaignName) => {
      if (!campaignName) return '';
      const parts = campaignName.split(' - ');
      return parts[0].trim();
    };

    // The old duplicate checks have been removed from here.

    // Process and insert data
    const processedData = csvData.map(row => {
      const campaignName = getColumnValue(row, ['Campaign name', 'Campaign Name', 'campaign_name', 'Campaign']);
      const extractedProductName = extractProductName(campaignName);
      const reportingStarts = getColumnValue(row, ['Reporting starts', 'reporting_starts']);
      const reportingEnds = getColumnValue(row, ['Reporting ends', 'reporting_ends']);
      
      return {
        user_id: user.id,
        file_name: req.file.originalname,
        platform: platform,
        campaign_name: campaignName,
        product_name: extractedProductName, // Use extracted product name from campaign
        amount_spent: parseNumber(getColumnValue(row, ['Amount spent (CAD)', 'Amount Spent', 'Spend', 'Cost'])),
        revenue: parseNumber(getColumnValue(row, ['Purchase ROAS (return on ad spend)', 'Revenue', 'Purchase Value', 'Conversion Value'])),
        conversions: parseNumber(getColumnValue(row, ['Purchases', 'Conversions', 'Orders', 'Results'])),
        clicks: parseNumber(getColumnValue(row, ['Link clicks', 'Clicks', 'Link Clicks'])),
        impressions: parseNumber(getColumnValue(row, ['Impressions', 'Reach'])),
        reporting_starts: reportingStarts ? new Date(reportingStarts).toISOString() : null,
        reporting_ends: reportingEnds ? new Date(reportingEnds).toISOString() : null,
        raw_data: row
      };
    });

    // Extract unique product names from processed data
    const uniqueProductNames = [...new Set(processedData
      .map(row => row.product_name)
      .filter(name => name && name.trim() !== '')
    )];

    // Auto-create products that don't exist
    for (const productName of uniqueProductNames) {
      try {
        // Check if product already exists
        const { data: existingProduct } = await supabaseServiceClient
          .from('products')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_name', productName)
          .single();

        if (!existingProduct) {
          // Create new product
          console.log(`Creating new product: ${productName}`);
          const { error: productError } = await supabaseServiceClient
            .from('products')
            .insert({
              user_id: user.id,
              product_name: productName,
              unit_cost: 0, // Default values - user can update manually
              selling_price: 0,
              units_delivered: 0,
              stock_purchased: 0,
              created_at: new Date().toISOString()
            });

          if (productError) {
            console.error(`Error creating product ${productName}:`, productError);
          } else {
            console.log(`✅ Created product: ${productName}`);
          }
        }
      } catch (error) {
        console.error(`Error processing product ${productName}:`, error);
      }
    }

    // Filter out empty rows and process data
    const validData = processedData.filter(row => 
      row.campaign_name && 
      row.campaign_name.trim() !== '' && 
      !row.campaign_name.includes('Total:') && // Skip summary rows
      !row.campaign_name.toLowerCase().includes('summary')
    );

    console.log(`📊 Processing ${validData.length} valid rows out of ${processedData.length} total rows`);

    if (validData.length === 0) {
      return res.status(400).json({ 
        error: 'No valid data found in CSV',
        details: 'All rows appear to be empty or summary rows. Please check your CSV format.'
      });
    }

    // Upsert campaign data instead of inserting
    const { data: upsertedCampaigns, error: campaignError } = await supabaseServiceClient
      .from('campaign_reports')
      .upsert(validData, { onConflict: 'user_id, campaign_name, reporting_starts' })
      .select();

    if (campaignError) {
      console.error('Error upserting campaign data:', campaignError);
      return res.status(500).json({ error: 'Failed to save campaign data', details: campaignError.message });
    }

    console.log(`✅ Upserted ${upsertedCampaigns.length} campaign records`);

    // Create upload history record
    const { error: historyError } = await supabaseServiceClient
      .from('upload_history')
      .insert({
        user_id: user.id,
        file_name: req.file.originalname,
        platform: platform,
        records_processed: validData.length,
        upload_date: new Date().toISOString()
      });

    if (historyError) {
      console.error('Error creating upload history:', historyError);
    }

    res.json({
      message: 'File uploaded and processed successfully',
      recordsProcessed: validData.length,
      productsCreated: uniqueProductNames.length,
      data: upsertedCampaigns
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Cleanup duplicate data endpoint
router.delete('/cleanup/:fileName', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error: authError } = await supabaseAuthClient.auth.getUser(token);
    if (authError) {
      return res.status(401).json({ error: authError.message });
    }

    const { fileName } = req.params;
    const { platform } = req.body;

    console.log(`🧹 Cleaning up data for file: ${fileName}, platform: ${platform}`);

    // Delete campaign reports for this file
    const { error: campaignError } = await supabaseServiceClient
      .from('campaign_reports')
      .delete()
      .eq('user_id', user.id)
      .eq('file_name', fileName)
      .eq('platform', platform);

    if (campaignError) {
      console.error('Error deleting campaigns:', campaignError);
    }

    // Delete upload history
    const { error: historyError } = await supabaseServiceClient
      .from('upload_history')
      .delete()
      .eq('user_id', user.id)
      .eq('file_name', fileName)
      .eq('platform', platform);

    if (historyError) {
      console.error('Error deleting upload history:', historyError);
    }

    res.json({ message: 'Data cleaned up successfully' });

  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;