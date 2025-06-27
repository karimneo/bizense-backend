const express = require('express');
const router = express.Router();
const { supabaseAuthClient, supabaseServiceClient } = require('../config/supabase');

// Get all products
router.get('/', async (req, res) => {
  try {
    console.log('🔍 PRODUCTS API CALLED');
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error: authError } = await supabaseAuthClient.auth.getUser(token);
    if (authError) {
      console.log('❌ Auth error:', authError.message);
      return res.status(401).json({ error: authError.message });
    }

    console.log('✅ User authenticated:', user.id);

    // Get products with performance data
    const { data: products, error: productsError } = await supabaseServiceClient
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (productsError) {
      console.log('❌ Products error:', productsError.message);
      return res.status(500).json({ error: productsError.message });
    }

    console.log('📦 Found products:', products?.length || 0);
    if (products && products.length > 0) {
      console.log('📦 Product names:', products.map(p => p.product_name));
    }

    // Get campaign data for each product
    const { data: campaigns, error: campaignsError } = await supabaseServiceClient
      .from('campaign_reports')
      .select('*')
      .eq('user_id', user.id);

    if (campaignsError) {
      console.log('❌ Campaigns error:', campaignsError.message);
      return res.status(500).json({ error: campaignsError.message });
    }

    console.log('📊 Found campaigns:', campaigns?.length || 0);

    // Calculate performance metrics for each product
    const productsWithMetrics = products.map(product => {
      const productCampaigns = campaigns.filter(c => 
        c.product_name && c.product_name.toLowerCase() === product.product_name.toLowerCase()
      );

      // New logic to handle summarizing unique campaigns
      const latestCampaigns = {};
      for (const campaign of productCampaigns) {
        // A unique key for each campaign instance (name + start date)
        const campaignKey = `${campaign.campaign_name}-${campaign.reporting_starts}`;
        
        // If we haven't seen this campaign yet, or if the current one is newer, update it
        if (!latestCampaigns[campaignKey] || new Date(campaign.created_at) > new Date(latestCampaigns[campaignKey].created_at)) {
          latestCampaigns[campaignKey] = campaign;
        }
      }

      // Convert the latest campaigns object back to an array
      const uniqueLatestCampaigns = Object.values(latestCampaigns);

      const totalSpend = uniqueLatestCampaigns.reduce((sum, c) => sum + (c.amount_spent || 0), 0);
      const totalConversions = uniqueLatestCampaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
      const totalClicks = uniqueLatestCampaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
      const totalImpressions = uniqueLatestCampaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);

      // Calculate metrics according to specification
      const unitsDelivered = product.units_delivered || 0;
      const sellingPrice = product.selling_price || 0;
      const unitCost = product.unit_cost || 0;

      // Revenue = Selling Price × Units Delivered
      const calculatedRevenue = sellingPrice * unitsDelivered;
      
      // Total Product Cost = Unit Cost × Units Delivered
      const totalProductCost = unitCost * unitsDelivered;
      
      // Profit = Revenue - Total Product Cost - Total Ad Spend
      const profit = calculatedRevenue - totalProductCost - totalSpend;
      
      // ROI = (Profit / Total Spend) × 100
      const roi = totalSpend > 0 ? (profit / totalSpend) * 100 : 0;
      
      // ROAS = Revenue / Spend (for comparison)
      const roas = totalSpend > 0 ? calculatedRevenue / totalSpend : 0;

      // Find best performing platform
      const platformPerformance = uniqueLatestCampaigns.reduce((acc, campaign) => {
        const platform = campaign.platform;
        if (!acc[platform]) {
          acc[platform] = { spend: 0, revenue: 0, roas: 0 };
        }
        acc[platform].spend += campaign.amount_spent || 0;
        acc[platform].revenue += campaign.revenue || 0;
        return acc;
      }, {});

      let bestPlatform = 'N/A';
      let bestRoas = 0;
      for (const [platform, metrics] of Object.entries(platformPerformance)) {
        const platformRoas = metrics.spend > 0 ? metrics.revenue / metrics.spend : 0;
        platformPerformance[platform].roas = platformRoas;
        if (platformRoas > bestRoas) {
          bestRoas = platformRoas;
          bestPlatform = platform;
        }
      }

                    return {
        ...product,
        // Campaign aggregates
        total_spend: Number(totalSpend.toFixed(2)),
        total_revenue: Number(calculatedRevenue.toFixed(2)),
        total_conversions: totalConversions,
        best_platform: bestPlatform || "N/A",
        roas: Number(roas.toFixed(2)),
        // Additional calculated fields
        profit: Number(profit.toFixed(2)),
        roi: Number(roi.toFixed(2))
      };
    });

    console.log('📤 Sending response with', productsWithMetrics.length, 'products');
    console.log('📤 Sample product:', productsWithMetrics[0]);

    res.json({ products: productsWithMetrics || [] });

  } catch (error) {
    console.error('❌ Products API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new product
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error: authError } = await supabaseAuthClient.auth.getUser(token);
    if (authError) {
      return res.status(401).json({ error: authError.message });
    }

    const { product_name, revenue_per_conversion } = req.body;

    if (!product_name) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    const { data, error } = await supabaseServiceClient
      .from('products')
      .insert({
        user_id: user.id,
        product_name,
        revenue_per_conversion: revenue_per_conversion || 0
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error: authError } = await supabaseAuthClient.auth.getUser(token);
    if (authError) {
      return res.status(401).json({ error: authError.message });
    }

    const { id } = req.params;
    const { 
      product_name, 
      revenue_per_conversion,
      unit_cost,
      selling_price,
      units_delivered,
      stock_purchased
    } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (product_name !== undefined) updateData.product_name = product_name;
    if (revenue_per_conversion !== undefined) updateData.revenue_per_conversion = revenue_per_conversion;
    if (unit_cost !== undefined) updateData.unit_cost = unit_cost;
    if (selling_price !== undefined) updateData.selling_price = selling_price;
    if (units_delivered !== undefined) updateData.units_delivered = units_delivered;
    if (stock_purchased !== undefined) updateData.stock_purchased = stock_purchased;

    console.log(`🔄 Updating product ${id} with:`, updateData);

    const { data, error } = await supabaseServiceClient
      .from('products')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error: authError } = await supabaseAuthClient.auth.getUser(token);
    if (authError) {
      return res.status(401).json({ error: authError.message });
    }

    const { id } = req.params;

    const { error } = await supabaseServiceClient
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;