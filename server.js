const http = require('http');
const url = require('url');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

let supabase;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log('✅ Supabase connected');
} else {
  console.log('❌ Missing Supabase credentials');
}

// Import route handlers
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const productsRoutes = require('./routes/products');
const reportsRoutes = require('./routes/reports');
const uploadRoutes = require('./routes/upload');
const productMetricsRoutes = require('./routes/product-metrics');

// Helper function to parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

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

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // Health check route
    if (pathname === '/api/health') {
      const response = {
        status: 'OK',
        message: 'BiZense V2 Backend is running!',
        timestamp: new Date().toISOString(),
        supabase: supabase ? 'Connected' : 'Not connected',
        version: '2.0.0'
      };
      res.writeHead(200);
      res.end(JSON.stringify(response));
      return;
    }

    // Test Supabase connection
    if (pathname === '/api/test-db') {
      if (!supabase) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Supabase not configured' }));
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      const response = {
        message: 'Database connection successful!',
        error: error ? error.message : null,
        timestamp: new Date().toISOString(),
        tablesChecked: ['profiles', 'products', 'campaign_reports', 'campaign_daily_stats', 'product_metrics']
      };
      
      res.writeHead(200);
      res.end(JSON.stringify(response));
      return;
    }

    // Route to enhanced dashboard API
    if (pathname.startsWith('/api/dashboard')) {
      req.url = pathname.replace('/api/dashboard', '');
      req.query = parsedUrl.query;
      dashboardRoutes(req, res);
      return;
    }

    // Route to enhanced products API
    if (pathname.startsWith('/api/products')) {
      req.url = pathname.replace('/api/products', '');
      req.params = {};
      if (pathname.match(/\/api\/products\/(.+)/)) {
        req.params.id = pathname.match(/\/api\/products\/(.+)/)[1];
      }
      productsRoutes(req, res);
      return;
    }

    // Route to NEW product metrics API
    if (pathname.startsWith('/api/product-metrics')) {
      req.url = pathname.replace('/api/product-metrics', '');
      req.params = {};
      
      // Handle different product-metrics routes
      if (pathname.match(/\/api\/product-metrics\/(.+)\/manual-update/)) {
        req.params.productId = pathname.match(/\/api\/product-metrics\/(.+)\/manual-update/)[1];
        req.url = '/' + req.params.productId + '/manual-update';
      } else if (pathname.match(/\/api\/product-metrics\/(.+)/)) {
        req.params.productId = pathname.match(/\/api\/product-metrics\/(.+)/)[1];
        req.url = '/' + req.params.productId;
      }
      
      productMetricsRoutes(req, res);
      return;
    }

    // Route to enhanced upload API
    if (pathname.startsWith('/api/upload')) {
      req.url = pathname.replace('/api/upload', '');
      uploadRoutes(req, res);
      return;
    }

    // Route to reports API
    if (pathname.startsWith('/api/reports')) {
      req.url = pathname.replace('/api/reports', '');
      req.params = {};
      if (pathname.match(/\/api\/reports\/(.+)/)) {
        req.params.id = pathname.match(/\/api\/reports\/(.+)/)[1];
      }
      reportsRoutes(req, res);
      return;
    }

    // Route to auth API
    if (pathname.startsWith('/api/auth')) {
      req.url = pathname.replace('/api/auth', '');
      authRoutes(req, res);
      return;
    }

    // 404 for unmatched routes
    res.writeHead(404);
    res.end(JSON.stringify({ 
      error: 'Not Found',
      message: 'API endpoint not found',
      availableEndpoints: [
        '/api/health',
        '/api/test-db',
        '/api/dashboard',
        '/api/products',
        '/api/product-metrics',
        '/api/upload',
        '/api/reports',
        '/api/auth'
      ]
    }));

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 BiZense V2 Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Database test: http://localhost:${PORT}/api/test-db`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down BiZense V2 Backend...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = server;