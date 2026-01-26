-- Migration: Add specific_categories to shops table

-- 1. Add column if it doesn't exist
ALTER TABLE public.shops 
ADD COLUMN IF NOT EXISTS specific_categories text[] DEFAULT '{}';

-- 2. Add description for documentation
COMMENT ON COLUMN public.shops.specific_categories IS 'Free-text tags or sub-categories for the shop';
