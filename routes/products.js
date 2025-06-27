const express = require('express');
const router = express.Router();
const { supabaseAuthClient, supabaseServiceClient } = require('../config/supabase');

// Helper function to get user from token
async function getUserFromToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No valid token provided');
  }
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAuthClient.auth.getUser(token);
  
  if (error) throw new Error(error.message);
  return user;
}

// Get all products
router.get('/', async (req, res) => {
  try {
    console.log('🔍 PRODUCTS API CALLED');
    
    const user = await getUserFromToken(req.headers.authorization);
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
      console.log('--- 🕵️ DB Product Names ---');
      products.forEach(p => {
        console.log(`  - Name: "${p.product_name}" (Length: ${p.product_name.length}), ID: ${p.id}`);
      });
      console.log('--------------------------');
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

      // Get latest version of each unique campaign
      const latestCampaignsMap = productCampaigns.reduce((map, campaign) => {
        const campaignKey = `${campaign.campaign_name}-${campaign.reporting_starts}`;
        const existing = map.get(campaignKey);

        if (!existing || new Date(campaign.created_at) > new Date(existing.created_at)) {
          map.set(campaignKey, campaign);
        }
        return map;
      }, new Map());

      const uniqueLatestCampaigns = Array.from(latestCampaignsMap.values());

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

      // Calculate additional metrics
      const cpl = totalClicks > 0 ? totalSpend / totalClicks : 0; // Cost Per Lead
      const cpo = totalConversions > 0 ? totalSpend / totalConversions : 0; // Cost Per Order
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

      // Find best performing platform
      const platformPerformance = uniqueLatestCampaigns.reduce((acc, campaign) => {
        const platform = campaign.platform;
        if (!acc[platform]) {
          acc[platform] = { spend: 0, revenue: 0, conversions: 0, clicks: 0 };
        }
        acc[platform].spend += campaign.amount_spent || 0;
        acc[platform].revenue += campaign.revenue || 0;
        acc[platform].conversions += campaign.conversions || 0;
        acc[platform].clicks += campaign.clicks || 0;
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
        total_clicks: totalClicks,
        total_impressions: totalImpressions,
        best_platform: bestPlatform || "N/A",
        roas: Number(roas.toFixed(2)),
        // Additional calculated fields
        profit: Number(profit.toFixed(2)),
        roi: Number(roi.toFixed(2)),
        cpl: Number(cpl.toFixed(2)),
        cpo: Number(cpo.toFixed(2)),
        conversion_rate: Number(conversionRate.toFixed(2)),
        platform_performance: platformPerformance
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

// Get single product detail with daily breakdown
router.get('/:id', async (req, res) => {
  try {
    const user = await getUserFromToken(req.headers.authorization);
    const { id } = req.params;

    // Get product details
    const { data: product, error: productError } = await supabaseServiceClient
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (productError) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get all campaigns for this product
    const { data: campaigns, error: campaignsError } = await supabaseServiceClient
      .from('campaign_reports')
      .select('*')
      .eq('user_id', user.id)
      .ilike('product_name', product.product_name);

    if (campaignsError) {
      return res.status(500).json({ error: campaignsError.message });
    }

    // Get daily data
    const { data: dailyData, error: dailyError } = await supabaseServiceClient
      .from('product_daily_data')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', id)
      .order('date', { ascending: true });

    if (dailyError) {
      return res.status(500).json({ error: dailyError.message });
    }

    // Process campaigns by date
    const campaignsByDate = campaigns.reduce((acc, campaign) => {
      if (campaign.reporting_starts) {
        const date = campaign.reporting_starts.split('T')[0]; // Get date part only
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(campaign);
      }
      return acc;
    }, {});

    // Create daily breakdown
    const dailyBreakdown = {};
    
    // Add campaign data
    Object.keys(campaignsByDate).forEach(date => {
      const dateCampaigns = campaignsByDate[date];
      
      // Get latest version of each campaign for this date
      const latestCampaigns = dateCampaigns.reduce((map, campaign) => {
        const key = campaign.campaign_name;
        const existing = map.get(key);
        if (!existing || new Date(campaign.created_at) > new Date(existing.created_at)) {
          map.set(key, campaign);
        }
        return map;
      }, new Map());

      const uniqueCampaigns = Array.from(latestCampaigns.values());
      
      const daySpend = uniqueCampaigns.reduce((sum, c) => sum + (c.amount_spent || 0), 0);
      const dayConversions = uniqueCampaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
      const dayClicks = uniqueCampaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
      const dayImpressions = uniqueCampaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);

      dailyBreakdown[date] = {
        date,
        spend: daySpend,
        conversions: dayConversions,
        clicks: dayClicks,
        impressions: dayImpressions,
        campaigns: uniqueCampaigns.length,
        units_delivered: 0, // Will be updated from daily data
        revenue: 0,
        profit: 0
      };
    });

    // Add manual daily data
    dailyData.forEach(daily => {
      const date = daily.date;
      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = {
          date,
          spend: daily.manual_spend || 0,
          conversions: 0,
          clicks: 0,
          impressions: 0,
          campaigns: 0,
          units_delivered: 0,
          revenue: 0,
          profit: 0
        };
      }
      
      // Update with manual data
      dailyBreakdown[date].units_delivered = daily.units_delivered || 0;
      dailyBreakdown[date].manual_revenue = daily.manual_revenue || 0;
      if (daily.manual_spend) {
        dailyBreakdown[date].spend += daily.manual_spend;
      }
      dailyBreakdown[date].notes = daily.notes;
    });

    // Calculate daily revenue and profit
    Object.values(dailyBreakdown).forEach(day => {
      const unitsDelivered = day.units_delivered;
      const sellingPrice = product.selling_price || 0;
      const unitCost = product.unit_cost || 0;
      
      // Use manual revenue if provided, otherwise calculate
      const dayRevenue = day.manual_revenue || (sellingPrice * unitsDelivered);
      const dayProductCost = unitCost * unitsDelivered;
      const dayProfit = dayRevenue - dayProductCost - day.spend;
      
      day.revenue = Number(dayRevenue.toFixed(2));
      day.profit = Number(dayProfit.toFixed(2));
      day.roi = day.spend > 0 ? Number(((dayProfit / day.spend) * 100).toFixed(2)) : 0;
      day.roas = day.spend > 0 ? Number((dayRevenue / day.spend).toFixed(2)) : 0;
    });

    // Calculate aggregated totals
    const totalSpend = Object.values(dailyBreakdown).reduce((sum, day) => sum + day.spend, 0);
    const totalRevenue = Object.values(dailyBreakdown).reduce((sum, day) => sum + day.revenue, 0);
    const totalConversions = Object.values(dailyBreakdown).reduce((sum, day) => sum + day.conversions, 0);
    const totalUnitsDelivered = Object.values(dailyBreakdown).reduce((sum, day) => sum + day.units_delivered, 0);
    const totalProfit = Object.values(dailyBreakdown).reduce((sum, day) => sum + day.profit, 0);

    const aggregatedMetrics = {
      total_spend: Number(totalSpend.toFixed(2)),
      total_revenue: Number(totalRevenue.toFixed(2)),
      total_conversions: totalConversions,
      total_units_delivered: totalUnitsDelivered,
      total_profit: Number(totalProfit.toFixed(2)),
      roi: totalSpend > 0 ? Number(((totalProfit / totalSpend) * 100).toFixed(2)) : 0,
      roas: totalSpend > 0 ? Number((totalRevenue / totalSpend).toFixed(2)) : 0
    };

    res.json({
      product,
      dailyBreakdown: Object.values(dailyBreakdown).sort((a, b) => new Date(a.date) - new Date(b.date)),
      aggregatedMetrics,
      campaignCount: campaigns.length
    });

  } catch (error) {
    console.error('❌ Product detail error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update product daily data
router.post('/:id/daily', async (req, res) => {
  try {
    const user = await getUserFromToken(req.headers.authorization);
    const { id } = req.params;
    const { date, units_delivered, manual_revenue, manual_spend, notes } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const { data, error } = await supabaseServiceClient
      .from('product_daily_data')
      .upsert({
        user_id: user.id,
        product_id: parseInt(id),
        date,
        units_delivered: units_delivered || 0,
        manual_revenue: manual_revenue || 0,
        manual_spend: manual_spend || 0,
        notes: notes || null
      }, {
        onConflict: 'user_id,product_id,date'
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);

  } catch (error) {
    console.error('❌ Daily data update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new product
router.post('/', async (req, res) => {
  try {
    const user = await getUserFromToken(req.headers.authorization);

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
    const user = await getUserFromToken(req.headers.authorization);

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
    const user = await getUserFromToken(req.headers.authorization);

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