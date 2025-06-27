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

// Get all products with enhanced sorting (Product List View)
router.get('/', async (req, res) => {
  try {
    console.log('🔍 PRODUCTS LIST API CALLED');
    
    const user = await getUserFromToken(req.headers.authorization);
    const { sortBy = 'roi', sortOrder = 'desc', search = '' } = req.query;
    
    console.log('✅ User authenticated:', user.id);
    console.log('📊 Query params:', { sortBy, sortOrder, search });

    // Get products with enhanced filtering
    let query = supabaseServiceClient
      .from('products')
      .select('*')
      .eq('user_id', user.id);

    // Add search filter if provided
    if (search) {
      query = query.ilike('product_name', `%${search}%`);
    }

    const { data: products, error: productsError } = await query.order('created_at', { ascending: false });

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

        if (!existing || new Date(campaign.created_at || 0) > new Date(existing.created_at || 0)) {
          map.set(campaignKey, campaign);
        }
        return map;
      }, new Map());

      const uniqueLatestCampaigns = Array.from(latestCampaignsMap.values());

      const totalSpend = uniqueLatestCampaigns.reduce((sum, c) => sum + (c.amount_spent || 0), 0);
      const totalConversions = uniqueLatestCampaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
      const totalClicks = uniqueLatestCampaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
      const totalImpressions = uniqueLatestCampaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);

      // Manual field values (Product Module requirements)
      const unitsDelivered = Number(product.units_delivered) || 0;
      const sellingPrice = Number(product.selling_price) || 0;
      const unitCost = Number(product.unit_cost) || 0;
      const stockPurchased = Number(product.stock_purchased) || 0;

      // EXACT CALCULATIONS as per Product Module specification:
      // Revenue = Selling Price × Units Delivered
      const calculatedRevenue = sellingPrice * unitsDelivered;
      
      // Total Product Cost = Unit Cost × Units Delivered
      const totalProductCost = unitCost * unitsDelivered;
      
      // Profit = Revenue - (Unit Cost × Units Delivered) - Total Ad Spend
      const profit = calculatedRevenue - totalProductCost - totalSpend;
      
      // ROI = (Profit / Spend) × 100
      const roi = totalSpend > 0 ? (profit / totalSpend) * 100 : 0;
      
      // ROAS = Revenue / Spend
      const roas = totalSpend > 0 ? calculatedRevenue / totalSpend : 0;

      // Other metrics: Leads, Confirmed Leads, CPL, CPO, Conversion Rates
      const leads = totalClicks; // Link clicks = Leads
      const confirmedLeads = totalConversions; // Conversions = Confirmed Leads
      const cpl = leads > 0 ? totalSpend / leads : 0; // Cost Per Lead
      const cpo = confirmedLeads > 0 ? totalSpend / confirmedLeads : 0; // Cost Per Order
      const conversionRate = leads > 0 ? (confirmedLeads / leads) * 100 : 0;

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
      let bestSpend = 0;
      
      for (const [platform, metrics] of Object.entries(platformPerformance)) {
        const platformRoas = metrics.spend > 0 ? metrics.revenue / metrics.spend : 0;
        platformPerformance[platform].roas = platformRoas;
        
        // Use ROAS if available, otherwise use highest spend platform
        if (platformRoas > bestRoas || (bestRoas === 0 && metrics.spend > bestSpend)) {
          bestRoas = platformRoas;
          bestSpend = metrics.spend;
          bestPlatform = platform;
        }
      }

      return {
        ...product,
        // Manual fields (user inputs as per Product Module requirement)
        unit_cost: Number(unitCost.toFixed(2)),
        selling_price: Number(sellingPrice.toFixed(2)),
        units_delivered: unitsDelivered,
        stock_purchased: stockPurchased,
        
        // Campaign aggregates
        total_spend: Number(totalSpend.toFixed(2)),
        total_conversions: totalConversions,
        total_clicks: totalClicks,
        total_impressions: totalImpressions,
        
        // Calculated metrics (exact formulas as per specification)
        total_revenue: Number(calculatedRevenue.toFixed(2)),
        profit: Number(profit.toFixed(2)),
        roi: Number(roi.toFixed(2)),
        roas: Number(roas.toFixed(2)),
        
        // Other metrics as specified
        leads: leads,
        confirmed_leads: confirmedLeads,
        cpl: Number(cpl.toFixed(2)),
        cpo: Number(cpo.toFixed(2)),
        conversion_rate: Number(conversionRate.toFixed(2)),
        
        // Platform analysis
        best_platform: bestPlatform || "N/A",
        platform_performance: platformPerformance,
        
        // Additional info
        active_campaigns: uniqueLatestCampaigns.length
      };
    });

    // Apply sorting (Product List View requirement: sorting by ROI, profit, or name)
    const sortableFields = ['profit', 'roi', 'roas', 'total_spend', 'total_revenue', 'product_name', 'created_at'];
    if (sortableFields.includes(sortBy)) {
      productsWithMetrics.sort((a, b) => {
        const aValue = sortBy === 'product_name' ? a[sortBy].toLowerCase() : (Number(a[sortBy]) || 0);
        const bValue = sortBy === 'product_name' ? b[sortBy].toLowerCase() : (Number(b[sortBy]) || 0);
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    console.log('📤 Sending response with', productsWithMetrics.length, 'products');
    console.log('📊 Sort applied:', { sortBy, sortOrder });
    if (productsWithMetrics[0]) {
      console.log('📤 Sample product metrics:', {
        name: productsWithMetrics[0].product_name,
        spend: productsWithMetrics[0].total_spend,
        revenue: productsWithMetrics[0].total_revenue,
        profit: productsWithMetrics[0].profit,
        roi: productsWithMetrics[0].roi
      });
    }

    res.json({ 
      products: productsWithMetrics || [],
      totalCount: productsWithMetrics.length,
      sortBy,
      sortOrder,
      search
    });

  } catch (error) {
    console.error('❌ Products API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single product detail with daily breakdown
router.get('/:id', async (req, res) => {
  try {
    console.log(`🔍 Product detail API called for ID: ${req.params.id}`);
    
    const user = await getUserFromToken(req.headers.authorization);
    const { id } = req.params;

    console.log(`✅ User authenticated for product detail: ${user.id}`);

    // Get product details
    const { data: product, error: productError } = await supabaseServiceClient
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (productError) {
      console.log(`❌ Product not found: ${productError.message}`);
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log(`📦 Found product: ${product.product_name}`);

    // Get all campaigns for this product
    const { data: campaigns, error: campaignsError } = await supabaseServiceClient
      .from('campaign_reports')
      .select('*')
      .eq('user_id', user.id)
      .ilike('product_name', product.product_name);

    if (campaignsError) {
      console.log(`❌ Campaigns error: ${campaignsError.message}`);
      return res.status(500).json({ error: campaignsError.message });
    }

    console.log(`📊 Found ${campaigns?.length || 0} campaigns for product`);

    // Get daily data (with error handling for missing table)
    let dailyData = [];
    try {
      const { data, error: dailyError } = await supabaseServiceClient
        .from('product_daily_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', id)
        .order('date', { ascending: true });

      if (dailyError) {
        console.log(`⚠️ Daily data table error (table might not exist): ${dailyError.message}`);
        dailyData = []; // Continue without daily data
      } else {
        dailyData = data || [];
        console.log(`📅 Found ${dailyData.length} daily data records`);
      }
    } catch (error) {
      console.log(`⚠️ Daily data fetch failed (table might not exist): ${error.message}`);
      dailyData = []; // Continue without daily data
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

    console.log(`📤 Sending product detail response for ${product.product_name}`);
    console.log(`📊 Aggregated metrics:`, aggregatedMetrics);

    res.json({
      product,
      dailyBreakdown: Object.values(dailyBreakdown).sort((a, b) => new Date(a.date) - new Date(b.date)),
      aggregatedMetrics,
      campaignCount: campaigns.length
    });

  } catch (error) {
    console.error('❌ Product detail error:', error);
    console.error('❌ Error stack:', error.stack);
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

// Bulk update manual fields for multiple products
router.put('/bulk-update', async (req, res) => {
  try {
    const user = await getUserFromToken(req.headers.authorization);
    const { updates } = req.body; // Array of { id, unit_cost, selling_price, units_delivered, stock_purchased }

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ error: 'Updates array is required' });
    }

    console.log(`🔄 Bulk updating ${updates.length} products`);

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { id, unit_cost, selling_price, units_delivered, stock_purchased } = update;

        // Build update object with only provided fields
        const updateData = {};
        if (unit_cost !== undefined) updateData.unit_cost = Number(unit_cost) || 0;
        if (selling_price !== undefined) updateData.selling_price = Number(selling_price) || 0;
        if (units_delivered !== undefined) updateData.units_delivered = Number(units_delivered) || 0;
        if (stock_purchased !== undefined) updateData.stock_purchased = Number(stock_purchased) || 0;

        const { data, error } = await supabaseServiceClient
          .from('products')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          errors.push({ id, error: error.message });
        } else {
          results.push(data);
          console.log(`✅ Updated product ${id}`);
        }
      } catch (error) {
        errors.push({ id: update.id, error: error.message });
      }
    }

    res.json({
      message: `Updated ${results.length} products successfully`,
      updated: results,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        total: updates.length,
        successful: results.length,
        failed: errors.length
      }
    });

  } catch (error) {
    console.error('❌ Bulk update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Enhanced Product Detail View with form update capabilities
router.get('/:id/detail', async (req, res) => {
  try {
    const user = await getUserFromToken(req.headers.authorization);
    const { id } = req.params;

    console.log(`🔍 Getting detailed view for product ${id}`);

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

    // Process campaigns by date for daily breakdown
    const campaignsByDate = campaigns.reduce((acc, campaign) => {
      if (campaign.reporting_starts) {
        const date = campaign.reporting_starts.split('T')[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(campaign);
      }
      return acc;
    }, {});

    // Create enhanced daily breakdown
    const dailyBreakdown = {};
    
    // Add campaign data
    Object.keys(campaignsByDate).forEach(date => {
      const dateCampaigns = campaignsByDate[date];
      
      // Get latest version of each campaign for this date (deduplication)
      const latestCampaigns = dateCampaigns.reduce((map, campaign) => {
        const key = campaign.campaign_name;
        const existing = map.get(key);
        if (!existing || new Date(campaign.created_at || 0) > new Date(existing.created_at || 0)) {
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
        leads: dayClicks,
        confirmed_leads: dayConversions,
        campaigns: uniqueCampaigns.length,
        units_delivered: 0, // Will be updated from daily data
        revenue: 0,
        profit: 0,
        roi: 0
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
          leads: 0,
          confirmed_leads: 0,
          campaigns: 0,
          units_delivered: 0,
          revenue: 0,
          profit: 0,
          roi: 0
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

    // Calculate daily revenue and profit using exact Product Module formulas
    Object.values(dailyBreakdown).forEach(day => {
      const unitsDelivered = day.units_delivered;
      const sellingPrice = Number(product.selling_price) || 0;
      const unitCost = Number(product.unit_cost) || 0;
      
      // Revenue = Selling Price × Units Delivered (or manual override)
      const dayRevenue = day.manual_revenue || (sellingPrice * unitsDelivered);
      
      // Total Product Cost = Unit Cost × Units Delivered
      const dayProductCost = unitCost * unitsDelivered;
      
      // Profit = Revenue - (Unit Cost × Units Delivered) - Total Ad Spend
      const dayProfit = dayRevenue - dayProductCost - day.spend;
      
      day.revenue = Number(dayRevenue.toFixed(2));
      day.profit = Number(dayProfit.toFixed(2));
      day.roi = day.spend > 0 ? Number(((dayProfit / day.spend) * 100).toFixed(2)) : 0;
      day.roas = day.spend > 0 ? Number((dayRevenue / day.spend).toFixed(2)) : 0;
    });

    // Calculate aggregated totals across all campaigns linked to the product
    const totalSpend = Object.values(dailyBreakdown).reduce((sum, day) => sum + day.spend, 0);
    const totalRevenue = Object.values(dailyBreakdown).reduce((sum, day) => sum + day.revenue, 0);
    const totalConversions = Object.values(dailyBreakdown).reduce((sum, day) => sum + day.conversions, 0);
    const totalClicks = Object.values(dailyBreakdown).reduce((sum, day) => sum + day.clicks, 0);
    const totalImpressions = Object.values(dailyBreakdown).reduce((sum, day) => sum + day.impressions, 0);
    const totalUnitsDelivered = Object.values(dailyBreakdown).reduce((sum, day) => sum + day.units_delivered, 0);
    const totalProfit = Object.values(dailyBreakdown).reduce((sum, day) => sum + day.profit, 0);

    const aggregatedMetrics = {
      total_spend: Number(totalSpend.toFixed(2)),
      total_revenue: Number(totalRevenue.toFixed(2)),
      total_conversions: totalConversions,
      total_clicks: totalClicks,
      total_impressions: totalImpressions,
      total_units_delivered: totalUnitsDelivered,
      total_profit: Number(totalProfit.toFixed(2)),
      leads: totalClicks,
      confirmed_leads: totalConversions,
      roi: totalSpend > 0 ? Number(((totalProfit / totalSpend) * 100).toFixed(2)) : 0,
      roas: totalSpend > 0 ? Number((totalRevenue / totalSpend).toFixed(2)) : 0,
      cpl: totalClicks > 0 ? Number((totalSpend / totalClicks).toFixed(2)) : 0,
      cpo: totalConversions > 0 ? Number((totalSpend / totalConversions).toFixed(2)) : 0,
      conversion_rate: totalClicks > 0 ? Number(((totalConversions / totalClicks) * 100).toFixed(2)) : 0
    };

    // Form fields for manual updates (Product Module requirement)
    const editableFields = {
      unit_cost: Number(product.unit_cost) || 0,
      selling_price: Number(product.selling_price) || 0,
      units_delivered: Number(product.units_delivered) || 0,
      stock_purchased: Number(product.stock_purchased) || 0
    };

    console.log(`✅ Product detail loaded: ${campaigns.length} campaigns, ${Object.keys(dailyBreakdown).length} days`);

    res.json({
      product: {
        ...product,
        ...editableFields
      },
      dailyBreakdown: Object.values(dailyBreakdown).sort((a, b) => new Date(a.date) - new Date(b.date)),
      aggregatedMetrics,
      editableFields,
      campaignCount: campaigns.length,
      dateRange: {
        start: Object.keys(dailyBreakdown).length > 0 ? Object.keys(dailyBreakdown).sort()[0] : null,
        end: Object.keys(dailyBreakdown).length > 0 ? Object.keys(dailyBreakdown).sort().pop() : null
      }
    });

  } catch (error) {
    console.error('❌ Product detail error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;