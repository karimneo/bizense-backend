require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { supabaseAuthClient, supabaseServiceClient } = require('./config/supabase');

// Import routes
const uploadRoutes = require('./routes/upload');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const productsRoutes = require('./routes/products');
const reportsRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

// Health check route
app.get('/api/health', (req, res) => {
  const response = {
    status: 'OK',
    message: 'BiZense Backend is running!',
    timestamp: new Date().toISOString(),
    supabase: supabaseServiceClient ? 'Connected' : 'Not connected'
  };
  res.json(response);
});

// Test Supabase connection
app.get('/api/test-db', async (req, res) => {
  try {
    if (!supabaseServiceClient) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    const { data, error } = await supabaseServiceClient
      .from('profiles')
      .select('count')
      .limit(1);

    const response = {
      message: 'Database connection successful!',
      error: error ? error.message : null,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard route
app.get('/api/dashboard', async (req, res) => {
  try {
    const user = await getUserFromToken(req.headers.authorization);
    
    const { data: campaigns, error } = await supabaseServiceClient
      .from('campaign_reports')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw new Error(error.message);

    // Calculate KPIs
    const totalSpend = campaigns.reduce((sum, c) => sum + (c.amount_spent || 0), 0);
    const totalRevenue = campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
    const roas = totalSpend > 0 ? (totalRevenue / totalSpend) : 0;

    // Platform breakdown
    const platformData = campaigns.reduce((acc, campaign) => {
      const platform = campaign.platform || 'unknown';
      if (!acc[platform]) {
        acc[platform] = { spend: 0, revenue: 0, conversions: 0 };
      }
      acc[platform].spend += campaign.amount_spent || 0;
      acc[platform].revenue += campaign.revenue || 0;
      acc[platform].conversions += campaign.conversions || 0;
      return acc;
    }, {});

    // Recent uploads
    const { data: recentUploads } = await supabaseServiceClient
      .from('upload_history')
      .select('*')
      .eq('user_id', user.id)
      .order('upload_date', { ascending: false })
      .limit(5);

    const response = {
      kpis: {
        totalSpend: totalSpend.toFixed(2),
        totalRevenue: totalRevenue.toFixed(2),
        roas: roas.toFixed(2),
        totalOrders: totalConversions
      },
      platformData,
      recentUploads: recentUploads || []
    };

    res.json(response);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reports route
app.get('/api/reports', async (req, res) => {
  try {
    const user = await getUserFromToken(req.headers.authorization);
    
    const { data: uploads, error } = await supabaseServiceClient
      .from('upload_history')
      .select('*')
      .eq('user_id', user.id)
      .order('upload_date', { ascending: false });

    if (error) throw new Error(error.message);

    res.json(uploads || []);
  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Register route modules
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/reports', reportsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`🚀 BiZense Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️  Test DB: http://localhost:${PORT}/api/test-db`);
  console.log(`📤 Upload: http://localhost:${PORT}/api/upload`);
});