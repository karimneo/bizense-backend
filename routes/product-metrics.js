const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Helper function to get user from token
async function getUserFromToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No valid token provided');
  }
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error) throw new Error(error.message);
  return user;
}

// COD Business Logic Calculations
function calculateCODMetrics(metrics, campaignData) {
  const {
    unit_cost,
    selling_price,
    units_delivered,
    stock_purchased,
    cod_fee_percentage = 5.0,
    service_fee_per_delivery = 8.50,
    service_fee_per_lead = 0.10
  } = metrics;

  // Basic calculations
  const totalProductCost = units_delivered * unit_cost;
  const cashCollected = units_delivered * selling_price;
  const codFees = cashCollected * (cod_fee_percentage / 100);
  
  // Campaign aggregated data
  const totalAdSpend = campaignData.reduce((sum, c) => sum + (c.amount_spent || 0), 0);
  const totalLeads = campaignData.reduce((sum, c) => sum + (c.leads || 0), 0);
  const totalReach = campaignData.reduce((sum, c) => sum + (c.reach || 0), 0);
  const totalImpressions = campaignData.reduce((sum, c) => sum + (c.impressions || 0), 0);
  const totalConfirmedLeads = campaignData.reduce((sum, c) => sum + (c.confirmed_leads || 0), 0);
  const totalDeliveredOrders = campaignData.reduce((sum, c) => sum + (c.delivered_orders || 0), 0);

  // Service fees calculation
  const serviceFees = (units_delivered * service_fee_per_delivery) + (totalLeads * service_fee_per_lead);
  
  // Performance metrics
  const leadDensity = totalReach > 0 ? totalReach / totalLeads : 0;
  const cpa = totalLeads > 0 ? totalAdSpend / totalLeads : 0;
  const costPerDelivered = totalDeliveredOrders > 0 ? totalAdSpend / totalDeliveredOrders : 0;
  
  // Net profit calculation
  const netProfit = cashCollected - totalAdSpend - codFees - serviceFees - totalProductCost;
  
  // ROAS calculation
  const roas = totalAdSpend > 0 ? (cashCollected / totalAdSpend) * 100 : 0;

  return {
    // Manual fields
    unit_cost,
    selling_price,
    units_delivered,
    stock_purchased,
    
    // Calculated fields
    totalProductCost,
    cashCollected,
    codFees,
    serviceFees,
    netProfit,
    
    // Campaign aggregated data
    totalAdSpend,
    totalLeads,
    totalReach,
    totalImpressions,
    totalConfirmedLeads,
    totalDeliveredOrders,
    
    // Performance metrics
    leadDensity,
    cpa,
    costPerDelivered,
    roas,
    
    // Profit margin
    profitMargin: cashCollected > 0 ? (netProfit / cashCollected) * 100 : 0
  };
}

// GET /api/product-metrics/:productId - Get product metrics and calculations
router.get('/:productId', async (req, res) => {
  try {
    const user = await getUserFromToken(req.headers.authorization);
    const { productId } = req.params;

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('user_id', user.id)
      .single();

    if (productError) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get product metrics (manual inputs)
    const { data: metrics, error: metricsError } = await supabase
      .from('product_metrics')
      .select('*')
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .single();

    if (metricsError && metricsError.code !== 'PGRST116') {
      return res.status(500).json({ error: metricsError.message });
    }

    // If no metrics exist, create default ones
    let productMetrics = metrics;
    if (!metrics) {
      const { data: newMetrics, error: createError } = await supabase
        .from('product_metrics')
        .insert({
          user_id: user.id,
          product_id: productId,
          unit_cost: 0,
          selling_price: 0,
          units_delivered: 0,
          stock_purchased: 0
        })
        .select()
        .single();

      if (createError) {
        return res.status(500).json({ error: createError.message });
      }
      productMetrics = newMetrics;
    }

    // Get campaign data for this product
    const { data: campaignData, error: campaignError } = await supabase
      .from('campaign_reports')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_extracted', product.product_name);

    if (campaignError) {
      return res.status(500).json({ error: campaignError.message });
    }

    // Get campaigns grouped by campaign name for display
    const { data: campaignSummary, error: summaryError } = await supabase
      .from('campaign_daily_stats')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_name', product.product_name)
      .order('date', { ascending: false });

    if (summaryError) {
      console.error('Campaign summary error:', summaryError);
    }

    // Calculate all COD metrics
    const calculations = calculateCODMetrics(productMetrics, campaignData || []);

    res.json({
      product,
      metrics: productMetrics,
      calculations,
      campaigns: campaignSummary || [],
      campaignCount: campaignData?.length || 0
    });

  } catch (error) {
    console.error('Get product metrics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/product-metrics/:productId - Update product metrics
router.put('/:productId', async (req, res) => {
  try {
    const user = await getUserFromToken(req.headers.authorization);
    const { productId } = req.params;
    const {
      unit_cost,
      selling_price,
      units_delivered,
      stock_purchased
    } = req.body;

    // Validate required fields
    if (unit_cost < 0 || selling_price < 0 || units_delivered < 0 || stock_purchased < 0) {
      return res.status(400).json({ error: 'All values must be non-negative' });
    }

    // Update product metrics
    const { data: updatedMetrics, error: updateError } = await supabase
      .from('product_metrics')
      .upsert({
        user_id: user.id,
        product_id: productId,
        unit_cost: parseFloat(unit_cost) || 0,
        selling_price: parseFloat(selling_price) || 0,
        units_delivered: parseInt(units_delivered) || 0,
        stock_purchased: parseInt(stock_purchased) || 0,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,product_id'
      })
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    res.json({
      message: 'Product metrics updated successfully',
      metrics: updatedMetrics
    });

  } catch (error) {
    console.error('Update product metrics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/product-metrics/:productId/manual-update - Update manual leads/orders
router.post('/:productId/manual-update', async (req, res) => {
  try {
    const user = await getUserFromToken(req.headers.authorization);
    const { productId } = req.params;
    const { campaignName, confirmed_leads, delivered_orders } = req.body;

    if (!campaignName) {
      return res.status(400).json({ error: 'Campaign name is required' });
    }

    // Update campaign data with manual values
    const { data: updatedCampaign, error: updateError } = await supabase
      .from('campaign_reports')
      .update({
        confirmed_leads: parseInt(confirmed_leads) || 0,
        delivered_orders: parseInt(delivered_orders) || 0
      })
      .eq('user_id', user.id)
      .eq('campaign_name', campaignName)
      .select();

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    // Also update daily stats
    const { error: dailyUpdateError } = await supabase
      .from('campaign_daily_stats')
      .update({
        confirmed_leads: parseInt(confirmed_leads) || 0,
        delivered_orders: parseInt(delivered_orders) || 0
      })
      .eq('user_id', user.id)
      .eq('campaign_name', campaignName);

    if (dailyUpdateError) {
      console.error('Daily stats update error:', dailyUpdateError);
    }

    res.json({
      message: 'Campaign data updated successfully',
      updated: updatedCampaign?.length || 0
    });

  } catch (error) {
    console.error('Manual update error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 