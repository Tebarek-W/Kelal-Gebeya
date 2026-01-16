-- Fix for Shops table missing columns
-- Run this in your Supabase SQL Editor

-- 1. Create Enum Type (if not exists)
DO $$ BEGIN
    CREATE TYPE public.shop_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add missing columns to shops table
ALTER TABLE public.shops 
ADD COLUMN IF NOT EXISTS status public.shop_status DEFAULT 'pending'::public.shop_status,
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS banner_url text,
ADD COLUMN IF NOT EXISTS contact_phone text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS admin_notes text;

-- 3. Verify RLS Policies (Optional but recommended)
-- Ensure policies use correct column names if they reference status
