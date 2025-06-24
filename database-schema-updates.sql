-- BiZense V2 - Database Schema Updates
-- Run these commands in your Supabase SQL Editor

-- 1. Update products table with COD-specific fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS selling_price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS units_delivered INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_purchased INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS total_leads INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS total_confirmed_leads INTEGER DEFAULT 0;

-- 2. Update campaign_reports table with additional COD metrics
ALTER TABLE campaign_reports ADD COLUMN IF NOT EXISTS reach INTEGER DEFAULT 0;
ALTER TABLE campaign_reports ADD COLUMN IF NOT EXISTS leads INTEGER DEFAULT 0;
ALTER TABLE campaign_reports ADD COLUMN IF NOT EXISTS confirmed_leads INTEGER DEFAULT 0;
ALTER TABLE campaign_reports ADD COLUMN IF NOT EXISTS delivered_orders INTEGER DEFAULT 0;
ALTER TABLE campaign_reports ADD COLUMN IF NOT EXISTS campaign_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE campaign_reports ADD COLUMN IF NOT EXISTS product_extracted VARCHAR(255);

-- 3. Create campaign_daily_stats table for daily aggregations
CREATE TABLE IF NOT EXISTS campaign_daily_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    campaign_name VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    amount_spent DECIMAL(10,2) DEFAULT 0,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    leads INTEGER DEFAULT 0,
    confirmed_leads INTEGER DEFAULT 0,
    delivered_orders INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, campaign_name, date)
);

-- 4. Create product_metrics table for manual COD calculations
CREATE TABLE IF NOT EXISTS product_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    unit_cost DECIMAL(10,2) DEFAULT 0,
    selling_price DECIMAL(10,2) DEFAULT 0,
    units_delivered INTEGER DEFAULT 0,
    stock_purchased INTEGER DEFAULT 0,
    manual_leads INTEGER DEFAULT 0,
    manual_confirmed_leads INTEGER DEFAULT 0,
    cod_fee_percentage DECIMAL(5,2) DEFAULT 5.00,
    service_fee_per_delivery DECIMAL(10,2) DEFAULT 8.50,
    service_fee_per_lead DECIMAL(10,2) DEFAULT 0.10,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- 5. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaign_daily_stats_user_date ON campaign_daily_stats(user_id, date);
CREATE INDEX IF NOT EXISTS idx_campaign_daily_stats_product ON campaign_daily_stats(product_name);
CREATE INDEX IF NOT EXISTS idx_campaign_reports_product_extracted ON campaign_reports(product_extracted);
CREATE INDEX IF NOT EXISTS idx_campaign_reports_campaign_date ON campaign_reports(campaign_date);

-- 6. Enable Row Level Security
ALTER TABLE campaign_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_metrics ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies
CREATE POLICY "Users can only see their own daily stats" ON campaign_daily_stats
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own product metrics" ON product_metrics
    FOR ALL USING (auth.uid() = user_id);

-- 8. Create function to extract product name from campaign
CREATE OR REPLACE FUNCTION extract_product_from_campaign(campaign_name TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Extract product name from "ProductName - Platform - GEO" format
    RETURN TRIM(SPLIT_PART(campaign_name, ' - ', 1));
END;
$$ LANGUAGE plpgsql;

-- 9. Create function to calculate COD fees
CREATE OR REPLACE FUNCTION calculate_cod_fees(cash_collected DECIMAL, fee_percentage DECIMAL DEFAULT 5.00)
RETURNS DECIMAL AS $$
BEGIN
    RETURN cash_collected * (fee_percentage / 100);
END;
$$ LANGUAGE plpgsql;

-- 10. Create function to calculate service fees
CREATE OR REPLACE FUNCTION calculate_service_fees(delivered_orders INTEGER, total_leads INTEGER, 
                                                 fee_per_delivery DECIMAL DEFAULT 8.50, 
                                                 fee_per_lead DECIMAL DEFAULT 0.10)
RETURNS DECIMAL AS $$
BEGIN
    RETURN (delivered_orders * fee_per_delivery) + (total_leads * fee_per_lead);
END;
$$ LANGUAGE plpgsql; 