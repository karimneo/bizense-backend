-- Add testing_budget field to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS testing_budget DECIMAL DEFAULT 0;

-- Update RLS policies to include the new field (no changes needed as existing policies cover all columns)

-- Add comment for documentation
COMMENT ON COLUMN public.products.testing_budget IS 'Manual field: Testing budget amount spent on this product for total investment calculation'; 