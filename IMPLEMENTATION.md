# 🚀 BiZense V2 Backend Implementation Guide

## 📋 What's Been Implemented

### ✅ **Database Schema Updates**
- Enhanced `products` table with COD-specific fields
- Enhanced `campaign_reports` table with additional metrics  
- New `campaign_daily_stats` table for aggregated data
- New `product_metrics` table for manual COD calculations
- PostgreSQL functions for COD calculations
- Proper indexes and RLS policies

### ✅ **Enhanced APIs**
1. **CSV Upload** (`/api/upload`)
   - Campaign name parsing (ProductName - Platform - GEO)
   - Auto product extraction and creation
   - Daily stats aggregation with upsert logic
   - Enhanced column mapping for Facebook/TikTok/Google

2. **Product Metrics** (`/api/product-metrics`)
   - Real-time COD calculations
   - Manual field updates (unit cost, selling price, etc.)
   - Campaign performance aggregation
   - Manual lead/order confirmations

3. **Enhanced Dashboard** (`/api/dashboard`)
   - All BiZense V2 KPIs with filtering
   - Platform and product breakdowns
   - Real profit calculations with COD business logic

### ✅ **COD Business Logic**
- **COD Fees**: 5% of cash collected (fixed)
- **Service Fees**: $8.50 per delivered + $0.1 per lead
- **Net Profit**: Cash Collected - Ad Spend - COD Fees - Service Fees - Product Cost
- **ROAS**: (Cash Collected / Ad Spend) × 100

## 🗄️ Step 1: Update Your Database

**Copy the contents of `database-schema-updates.sql` and run in your Supabase SQL Editor**

## 🚀 Step 2: Start Your Server

```bash
# Start your BiZense V2 backend
npm start
# or 
node server.js
```

## 🧪 Step 3: Test APIs

```bash
# Run the test script
node test-api.js
```

## 📊 Step 4: API Endpoints Reference

### **Dashboard API**
```
GET /api/dashboard?start_date=2024-01-01&end_date=2024-01-31&platform=facebook&product=superslim
```

**Returns all BiZense V2 KPIs:**
- Total Ad Spend, Leads, Reach, Impressions
- Lead Density, CPA, Cost per Delivered
- Confirmed Leads, Delivered Orders
- Gross Cash Collected, COD Fees, Service Fees
- Total Product Costs, Net Profit, ROAS

### **Product Metrics API**
```
GET /api/product-metrics/{productId}
PUT /api/product-metrics/{productId}
POST /api/product-metrics/{productId}/manual-update
```

### **Enhanced Upload API**
```
POST /api/upload
Content-Type: multipart/form-data
Body: file=your.csv, platform=facebook
```

**Features:**
- Auto-extracts product from "ProductName - Platform - GEO" format
- Creates products automatically if they don't exist
- Aggregates daily stats with duplicate handling
- Maps Facebook/TikTok/Google column variations

## 📈 Step 5: CSV Upload Testing

Create a test CSV with these columns:

**Facebook CSV:**
```csv
Campaign name,Amount spent (CAD),Reach,Impressions,Link clicks,Purchases,Purchase ROAS (return on ad spend)
SuperSlim Pro - Facebook - USA,120.50,5000,15000,240,12,599.88
FitMax Elite - Facebook - Canada,95.75,3500,12000,180,8,639.20
```

## 🎯 Step 6: Manual Data Entry Workflow

1. **Upload CSV** → Auto-creates products and campaigns
2. **Go to Product Detail page** → Enter unit cost, selling price, units delivered
3. **Update manual leads/orders** → Use product metrics API to set confirmed_leads and delivered_orders
4. **View Dashboard** → See real COD profit calculations

## 📋 Step 7: Business Logic Verification

**Test these calculations manually:**

1. **Cash Collected** = Units Delivered × Selling Price
2. **COD Fees** = Cash Collected × 5%
3. **Service Fees** = (Units Delivered × $8.50) + (Total Leads × $0.1)
4. **Product Cost** = Units Delivered × Unit Cost
5. **Net Profit** = Cash Collected - Ad Spend - COD Fees - Service Fees - Product Cost
6. **ROAS** = (Cash Collected / Ad Spend) × 100

## 🔧 Troubleshooting

### Common Issues:

1. **Database connection error:**
   - Check your `.env` file has correct SUPABASE_URL and SUPABASE_SERVICE_KEY

2. **CSV upload fails:**
   - Ensure column names match expected variants
   - Check file size (10MB limit)
   - Verify platform parameter is 'facebook', 'tiktok', or 'google'

3. **Product metrics not calculating:**
   - Ensure product exists and has metrics entry
   - Check campaign data has product_extracted field populated

## 🎉 Success Indicators

✅ **CSV Upload working** → Products auto-created, campaigns aggregated daily  
✅ **Product metrics** → Real-time COD calculations updating  
✅ **Dashboard filters** → Date/platform/product filtering functional  
✅ **Manual updates** → Confirmed leads and delivered orders editable  
✅ **Profit calculations** → Net profit showing correctly with all COD fees  

Your BiZense V2 backend is now ready for real COD business operations! 🚀 