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
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY, // ⚠️ Must be the Service Role Key
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  console.log('✅ Supabase connected');
} else {
  console.log('❌ Missing Supabase credentials');
}

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
        message: 'BiZense Backend is running!',
        timestamp: new Date().toISOString(),
        supabase: supabase ? 'Connected' : 'Not connected'
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
        timestamp: new Date().toISOString()
      };
      
      res.writeHead(200);
      res.end(JSON.stringify(response));
      return;
    }

    // Dashboard route
    if (pathname === '/api/dashboard' && method === 'GET') {
      const user = await getUserFromToken(req.headers.authorization);
      
      const { data: campaigns, error } = await supabase
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
      const { data: recentUploads } = await supabase
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

      res.writeHead(200);
      res.end(JSON.stringify(response));
      return;
    }

    // Simple upload route (we'll enhance this later)
    if (pathname === '/api/upload' && method === 'POST') {
      const user = await getUserFromToken(req.headers.authorization);
      
      // For now, just return success
      res.writeHead(200);
      res.end(JSON.stringify({
        message: 'Upload endpoint ready',
        user: user.email
      }));
      return;
    }

    // Products routes
    if (pathname === '/api/products' && method === 'GET') {
      const user = await getUserFromToken(req.headers.authorization);
      
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);

      res.writeHead(200);
      res.end(JSON.stringify(products || []));
      return;
    }

    if (pathname === '/api/products' && method === 'POST') {
      const user = await getUserFromToken(req.headers.authorization);
      const body = await parseBody(req);
      
      const { product_name, revenue_per_conversion } = body;
      
      if (!product_name) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Product name is required' }));
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          product_name,
          revenue_per_conversion: revenue_per_conversion || 0
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      res.writeHead(200);
      res.end(JSON.stringify(data));
      return;
    }

    // Reports route
    if (pathname === '/api/reports' && method === 'GET') {
      const user = await getUserFromToken(req.headers.authorization);
      
      const { data: uploads, error } = await supabase
        .from('upload_history')
        .select('*')
        .eq('user_id', user.id)
        .order('upload_date', { ascending: false });

      if (error) throw new Error(error.message);

      res.writeHead(200);
      res.end(JSON.stringify(uploads || []));
      return;
    }

    // 404 for all other routes
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Route not found' }));

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 BiZense Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️  Test DB: http://localhost:${PORT}/api/test-db`);
});