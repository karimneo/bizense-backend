-- Create product_daily_data table for daily delivery tracking
CREATE TABLE IF NOT EXISTS public.product_daily_data (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    units_delivered INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(product_id, date)
);

-- Enable RLS
ALTER TABLE public.product_daily_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own daily data" ON public.product_daily_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily data" ON public.product_daily_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily data" ON public.product_daily_data
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily data" ON public.product_daily_data
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_product_daily_data_product_id ON public.product_daily_data(product_id);
CREATE INDEX IF NOT EXISTS idx_product_daily_data_user_date ON public.product_daily_data(user_id, date); 