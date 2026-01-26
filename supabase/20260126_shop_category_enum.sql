-- Migration: Add shop_category enum and enforce on shops table
-- Designed for maximum compatibility with existing data

-- 1. Create Enum Type safely
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shop_category') THEN
        CREATE TYPE public.shop_category AS ENUM ('Fashion', 'Electronics', 'Jewelry', 'Handmade Crafts');
    END IF;
END $$;

-- 2. Data Mapping & Normalization
-- Map existing text categories to the new Enum values where possible (case-insensitive)
-- Any unrecognized categories default to 'Fashion' to satisfy NOT NULL constraint
UPDATE public.shops
SET category = 
    CASE 
        WHEN category ILIKE 'fashion%' THEN 'Fashion'
        WHEN category ILIKE 'electronics%' THEN 'Electronics'
        WHEN category ILIKE 'jewelry%' THEN 'Jewelry'
        WHEN category ILIKE 'handmade%' OR category ILIKE 'crafts%' THEN 'Handmade Crafts'
        ELSE 'Fashion'
    END
WHERE category IS NULL 
   OR category NOT IN ('Fashion', 'Electronics', 'Jewelry', 'Handmade Crafts');

-- 3. Alter Table to use Enum safely
-- We use a USING clause to cast correctly
ALTER TABLE public.shops 
ALTER COLUMN category TYPE public.shop_category 
USING (
    CASE 
        WHEN category IN ('Fashion', 'Electronics', 'Jewelry', 'Handmade Crafts') THEN category::public.shop_category
        ELSE 'Fashion'::public.shop_category
    END
);

-- 4. Enforce constraints
ALTER TABLE public.shops
ALTER COLUMN category SET NOT NULL;

-- 5. Add a comment for documentation
COMMENT ON COLUMN public.shops.category IS 'Locked shop categories: Fashion, Electronics, Jewelry, Handmade Crafts';
