// BiZense V2 API Testing Script
// Run this with: node test-api.js

const http = require('http');

const API_BASE = 'http://localhost:3001';

// Helper function to make HTTP requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  console.log('🏥 Testing Health Check...');
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/health',
      method: 'GET'
    });
    
    if (result.status === 200) {
      console.log('✅ Health check passed');
      console.log(`   Version: ${result.data.version}`);
      console.log(`   Supabase: ${result.data.supabase}`);
    } else {
      console.log('❌ Health check failed');
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
  }
}

async function testDatabaseConnection() {
  console.log('🗄️  Testing Database Connection...');
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/test-db',
      method: 'GET'
    });
    
    if (result.status === 200) {
      console.log('✅ Database connection successful');
      console.log(`   Tables checked: ${result.data.tablesChecked?.join(', ')}`);
    } else {
      console.log('❌ Database connection failed');
    }
  } catch (error) {
    console.log('❌ Database test error:', error.message);
  }
}

async function testDashboardAPI() {
  console.log('📊 Testing Dashboard API...');
  try {
    // Test without auth first (should fail)
    const result = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/dashboard',
      method: 'GET'
    });
    
    if (result.status === 401) {
      console.log('✅ Dashboard API auth protection working');
    } else {
      console.log('⚠️  Dashboard API should require auth');
    }
    
    // Test with filters
    const filteredResult = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/dashboard?platform=facebook&start_date=2024-01-01',
      method: 'GET'
    });
    
    console.log(`   Filtered request status: ${filteredResult.status}`);
    
  } catch (error) {
    console.log('❌ Dashboard API error:', error.message);
  }
}

async function testProductsAPI() {
  console.log('📦 Testing Products API...');
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/products',
      method: 'GET'
    });
    
    if (result.status === 401) {
      console.log('✅ Products API auth protection working');
    } else {
      console.log('⚠️  Products API should require auth');
    }
  } catch (error) {
    console.log('❌ Products API error:', error.message);
  }
}

async function testProductMetricsAPI() {
  console.log('📈 Testing Product Metrics API...');
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/product-metrics/test-id',
      method: 'GET'
    });
    
    if (result.status === 401) {
      console.log('✅ Product Metrics API auth protection working');
    } else {
      console.log('⚠️  Product Metrics API should require auth');
    }
  } catch (error) {
    console.log('❌ Product Metrics API error:', error.message);
  }
}

async function testUploadAPI() {
  console.log('📤 Testing Upload API...');
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/upload',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (result.status === 401) {
      console.log('✅ Upload API auth protection working');
    } else {
      console.log('⚠️  Upload API should require auth');
    }
  } catch (error) {
    console.log('❌ Upload API error:', error.message);
  }
}

async function test404Handling() {
  console.log('🔍 Testing 404 Handling...');
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/nonexistent',
      method: 'GET'
    });
    
    if (result.status === 404) {
      console.log('✅ 404 handling working');
      console.log(`   Available endpoints: ${result.data.availableEndpoints?.length || 0}`);
    } else {
      console.log('❌ 404 handling not working');
    }
  } catch (error) {
    console.log('❌ 404 test error:', error.message);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 BiZense V2 API Testing Starting...\n');
  
  await testHealthCheck();
  console.log('');
  
  await testDatabaseConnection();
  console.log('');
  
  await testDashboardAPI();
  console.log('');
  
  await testProductsAPI();
  console.log('');
  
  await testProductMetricsAPI();
  console.log('');
  
  await testUploadAPI();
  console.log('');
  
  await test404Handling();
  console.log('');
  
  console.log('🎯 API Testing Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Copy database-schema-updates.sql to Supabase SQL Editor');
  console.log('2. Run the SQL commands to update your database');
  console.log('3. Test CSV upload with a real file');
  console.log('4. Create products and test product metrics');
  console.log('5. Connect your frontend to these APIs');
}

// Check if server is running first
console.log('Checking if BiZense V2 server is running...');
setTimeout(() => {
  runAllTests().catch(console.error);
}, 1000); 