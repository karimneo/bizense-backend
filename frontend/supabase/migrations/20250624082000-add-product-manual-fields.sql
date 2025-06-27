-- Add manual fields to products table as per Product Module specification
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS selling_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS units_delivered INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock_purchased INTEGER DEFAULT 0;

-- Create product_daily_data table for tracking daily breakdown
CREATE TABLE IF NOT EXISTS public.product_daily_data (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  units_delivered INTEGER DEFAULT 0,
  manual_revenue DECIMAL(10,2) DEFAULT 0,
  manual_spend DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id, date)
);

-- Add RLS policies for product_daily_data table
ALTER TABLE public.product_daily_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own product daily data" ON public.product_daily_data
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own product daily data" ON public.product_daily_data
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product daily data" ON public.product_daily_data
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product daily data" ON public.product_daily_data
FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for products table if not already exist
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own products" ON public.products;
CREATE POLICY "Users can view their own products" ON public.products
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own products" ON public.products;
CREATE POLICY "Users can insert their own products" ON public.products
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own products" ON public.products;
CREATE POLICY "Users can update their own products" ON public.products
FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own products" ON public.products;
CREATE POLICY "Users can delete their own products" ON public.products
FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger for product_daily_data
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_daily_data_updated_at ON public.product_daily_data;
CREATE TRIGGER product_daily_data_updated_at
  BEFORE UPDATE ON public.product_daily_data
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at(); 