const supabase = require('../config/supabase');
const url = require('url');

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

// Enhanced dashboard analytics with COD business logic
async function handleDashboard(req, res) {
  try {
    const user = await getUserFromToken(req.headers.authorization);
    
    // Extract filters from query parameters
    const {
      start_date,
      end_date,
      platform,
      product
    } = req.query;

    console.log('Dashboard filters:', { start_date, end_date, platform, product });

    // Build dynamic query for campaign data
    let campaignQuery = supabase
      .from('campaign_daily_stats')
      .select('*')
      .eq('user_id', user.id);

    // Apply filters
    if (start_date) {
      campaignQuery = campaignQuery.gte('date', start_date);
    }
    if (end_date) {
      campaignQuery = campaignQuery.lte('date', end_date);
    }
    if (platform && platform !== 'all') {
      campaignQuery = campaignQuery.eq('platform', platform);
    }
    if (product && product !== 'all') {
      campaignQuery = campaignQuery.eq('product_name', product);
    }

    const { data: campaigns, error: campaignError } = await campaignQuery;

    if (campaignError) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: campaignError.message }));
    }

    // Get all product metrics for COD calculations
    const { data: productMetrics, error: metricsError } = await supabase
      .from('product_metrics')
      .select(`
        *,
        products!inner(
          id,
          product_name
        )
      `)
      .eq('user_id', user.id);

    if (metricsError) {
      console.error('Product metrics error:', metricsError);
    }

    // Calculate BiZense V2 COD KPIs
    const calculateDashboardKPIs = (campaigns, metrics) => {
      // Basic aggregations from campaigns
      const totalAdSpend = campaigns.reduce((sum, c) => sum + (c.amount_spent || 0), 0);
      const totalLeads = campaigns.reduce((sum, c) => sum + (c.leads || 0), 0);
      const totalReach = campaigns.reduce((sum, c) => sum + (c.reach || 0), 0);
      const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
      const totalConfirmedLeads = campaigns.reduce((sum, c) => sum + (c.confirmed_leads || 0), 0);
      const totalDeliveredOrders = campaigns.reduce((sum, c) => sum + (c.delivered_orders || 0), 0);

      // COD calculations from product metrics
      let grossCashCollected = 0;
      let totalProductCosts = 0;
      let totalUnitsDelivered = 0;

      if (metrics && metrics.length > 0) {
        metrics.forEach(metric => {
          const cashForProduct = metric.units_delivered * metric.selling_price;
          const costForProduct = metric.units_delivered * metric.unit_cost;
          
          grossCashCollected += cashForProduct;
          totalProductCosts += costForProduct;
          totalUnitsDelivered += metric.units_delivered;
        });
      }

      // COD business logic calculations
      const codFees = grossCashCollected * 0.05; // 5% fixed
      const serviceFees = (totalUnitsDelivered * 8.5) + (totalLeads * 0.1); // $8.50 per delivery + $0.1 per lead
      
      // Performance metrics
      const leadDensity = totalReach > 0 ? totalReach / totalLeads : 0;
      const cpa = totalLeads > 0 ? totalAdSpend / totalLeads : 0;
      const costPerDelivered = totalDeliveredOrders > 0 ? totalAdSpend / totalDeliveredOrders : 0;
      
      // Net profit calculation
      const netProfit = grossCashCollected - totalAdSpend - codFees - serviceFees - totalProductCosts;
      
      // ROAS calculation
      const roas = totalAdSpend > 0 ? (grossCashCollected / totalAdSpend) * 100 : 0;

      return {
        totalAdSpend,
        totalLeads,
        totalReach,
        totalImpressions,
        leadDensity,
        cpa,
        costPerDelivered,
        totalConfirmedLeads,
        totalDeliveredOrders,
        grossCashCollected,
        codFees,
        serviceFees,
        totalProductCosts,
        netProfit,
        roas
      };
    };

    const kpis = calculateDashboardKPIs(campaigns || [], productMetrics || []);

    // Platform breakdown
    const platformData = (campaigns || []).reduce((acc, campaign) => {
      const platform = campaign.platform || 'unknown';
      if (!acc[platform]) {
        acc[platform] = { 
          spend: 0, 
          leads: 0, 
          reach: 0, 
          impressions: 0,
          confirmed_leads: 0,
          delivered_orders: 0
        };
      }
      acc[platform].spend += campaign.amount_spent || 0;
      acc[platform].leads += campaign.leads || 0;
      acc[platform].reach += campaign.reach || 0;
      acc[platform].impressions += campaign.impressions || 0;
      acc[platform].confirmed_leads += campaign.confirmed_leads || 0;
      acc[platform].delivered_orders += campaign.delivered_orders || 0;
      return acc;
    }, {});

    // Product performance breakdown
    const productData = (campaigns || []).reduce((acc, campaign) => {
      const product = campaign.product_name || 'unknown';
      if (!acc[product]) {
        acc[product] = { 
          spend: 0, 
          leads: 0, 
          reach: 0,
          confirmed_leads: 0,
          delivered_orders: 0
        };
      }
      acc[product].spend += campaign.amount_spent || 0;
      acc[product].leads += campaign.leads || 0;
      acc[product].reach += campaign.reach || 0;
      acc[product].confirmed_leads += campaign.confirmed_leads || 0;
      acc[product].delivered_orders += campaign.delivered_orders || 0;
      return acc;
    }, {});

    // Recent campaigns (last 10)
    const recentCampaigns = (campaigns || [])
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)
      .map(campaign => ({
        ...campaign,
        roas: campaign.amount_spent > 0 ? ((campaign.revenue || 0) / campaign.amount_spent) * 100 : 0,
        cpa: campaign.leads > 0 ? campaign.amount_spent / campaign.leads : 0
      }));

    // Top performing products
    const topProducts = Object.entries(productData)
      .map(([name, data]) => ({
        name,
        ...data,
        roas: data.spend > 0 ? ((data.delivered_orders * 50) / data.spend) * 100 : 0 // Estimate revenue
      }))
      .sort((a, b) => b.roas - a.roas)
      .slice(0, 5);

    // Recent uploads
    const { data: recentUploads } = await supabase
      .from('upload_history')
      .select('*')
      .eq('user_id', user.id)
      .order('upload_date', { ascending: false })
      .limit(5);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      kpis: {
        totalAdSpend: kpis.totalAdSpend.toFixed(2),
        totalLeads: kpis.totalLeads,
        totalReach: kpis.totalReach,
        totalImpressions: kpis.totalImpressions,
        leadDensity: kpis.leadDensity.toFixed(1),
        cpa: kpis.cpa.toFixed(2),
        costPerDelivered: kpis.costPerDelivered.toFixed(2),
        totalConfirmedLeads: kpis.totalConfirmedLeads,
        totalDeliveredOrders: kpis.totalDeliveredOrders,
        grossCashCollected: kpis.grossCashCollected.toFixed(2),
        codFees: kpis.codFees.toFixed(2),
        serviceFees: kpis.serviceFees.toFixed(2),
        totalProductCosts: kpis.totalProductCosts.toFixed(2),
        netProfit: kpis.netProfit.toFixed(2),
        roas: kpis.roas.toFixed(1)
      },
      platformData,
      productData,
      topProducts,
      recentCampaigns,
      recentUploads: recentUploads || [],
      summary: {
        totalCampaigns: campaigns?.length || 0,
        activePlatforms: Object.keys(platformData).length,
        activeProducts: Object.keys(productData).length,
        profitMargin: kpis.grossCashCollected > 0 ? ((kpis.netProfit / kpis.grossCashCollected) * 100).toFixed(1) : '0.0'
      }
    }));

  } catch (error) {
    console.error('Dashboard error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

// Route handler
module.exports = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;

  if (method === 'GET' && req.url === '') {
    return handleDashboard(req, res);
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Dashboard route not found' }));
};