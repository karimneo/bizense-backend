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

    // Helper function to safely parse numbers
    const parseNumber = (value) => {
      if (!value) return 0;
      const cleaned = String(value).replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Map common CSV column names to our schema
    const getColumnValue = (row, possibleNames) => {
      for (const name of possibleNames) {
        if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
          return row[name];
        }
      }
      return '';
    };

    // Helper function to extract product name from campaign name
    const extractProductName = (campaignName) => {
      if (!campaignName) return '';
      // Extract everything before the first dash (ProductName - Platform - GEO)
      const parts = campaignName.split(' - ');
      return parts[0].trim();
    };

    // Process and insert data
    const processedData = csvData.map(row => {
      const campaignName = getColumnValue(row, ['Campaign name', 'Campaign Name', 'campaign_name', 'Campaign']);
      const extractedProductName = extractProductName(campaignName);
      
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

    // Insert into database
    const { data: insertedData, error: insertError } = await supabaseServiceClient
      .from('campaign_reports')
      .insert(processedData)
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      console.error('Processed data sample:', processedData[0]);
      return res.status(500).json({ 
        error: 'Failed to save data to database',
        details: insertError.message,
        code: insertError.code 
      });
    }

    // Create upload history record
    const { error: historyError } = await supabaseServiceClient
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
      message: 'File uploaded successfully',
      rowsProcessed: processedData.length,
      productsFound: uniqueProductNames.length,
      productNames: uniqueProductNames,
      data: insertedData
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;