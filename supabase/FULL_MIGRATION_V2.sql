-- FULL MIGRATION SCRIPT (SCHEMA + DATA RESTORE)
-- Run this ENTIRE script in Supabase SQL Editor to rebuild your database and restore user profiles.

-- ==========================================
-- 1. SETUP SCHEMA (Tables, Types, Policies)
-- ==========================================

-- Create Enum Types
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('buyer', 'vendor', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.shop_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Tables

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  role public.user_role default 'buyer'::public.user_role,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Shops
CREATE TABLE IF NOT EXISTS public.shops (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  logo_url text,
  banner_url text,
  contact_phone text,
  address text,
  category text,
  status public.shop_status default 'pending'::public.shop_status,
  is_verified boolean default false,
  admin_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id uuid default gen_random_uuid() primary key,
  shop_id uuid references public.shops(id) on delete cascade not null,
  name text not null,
  description text,
  price numeric not null,
  images text[],
  stock integer default 0,
  category text,
  sizes text[],
  colors text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references public.profiles(id),
  shop_id uuid references public.shops(id),
  total_price numeric not null,
  payment_method text,
  status public.order_status default 'pending'::public.order_status,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id),
  quantity integer not null,
  price numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Dropping first to avoid conflicts)

-- Profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

create policy "Admins can view all profiles" on public.profiles for select using ((select role from public.profiles where id = auth.uid()) = 'admin');
create policy "Admins can update all profiles" on public.profiles for update using ((select role from public.profiles where id = auth.uid()) = 'admin');
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Shops
DROP POLICY IF EXISTS "Admins can view all shops" ON public.shops;
DROP POLICY IF EXISTS "Admins can update all shops" ON public.shops;
DROP POLICY IF EXISTS "Admins can delete shops" ON public.shops;
DROP POLICY IF EXISTS "Shops are viewable by everyone." ON public.shops;
DROP POLICY IF EXISTS "Vendors can insert their own shop." ON public.shops;
DROP POLICY IF EXISTS "Vendors can update own shop." ON public.shops;

create policy "Admins can view all shops" on public.shops for select using ((select role from public.profiles where id = auth.uid()) = 'admin');
create policy "Admins can update all shops" on public.shops for update using ((select role from public.profiles where id = auth.uid()) = 'admin');
create policy "Admins can delete shops" on public.shops for delete using ((select role from public.profiles where id = auth.uid()) = 'admin');
create policy "Shops are viewable by everyone." on public.shops for select using (true);
create policy "Vendors can insert their own shop." on public.shops for insert with check (auth.uid() = owner_id);
create policy "Vendors can update own shop." on public.shops for update using (auth.uid() = owner_id);

-- Products
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Products are viewable by everyone." ON public.products;
DROP POLICY IF EXISTS "Vendors can insert products to own shop." ON public.products;
DROP POLICY IF EXISTS "Vendors can update own products." ON public.products;

create policy "Admins can delete products" on public.products for delete using ((select role from public.profiles where id = auth.uid()) = 'admin');
create policy "Products are viewable by everyone." on public.products for select using (true);
create policy "Vendors can insert products to own shop." on public.products for insert with check (exists (select 1 from public.shops where id = shop_id and owner_id = auth.uid()));
create policy "Vendors can update own products." on public.products for update using (exists (select 1 from public.shops where id = shop_id and owner_id = auth.uid()));

-- Orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Vendors can view orders for their shop" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Vendors can update orders for their shop" ON public.orders;

create policy "Users can view their own orders" on public.orders for select using (auth.uid() = buyer_id);
create policy "Vendors can view orders for their shop" on public.orders for select using (exists (select 1 from public.shops where id = shop_id and owner_id = auth.uid()));
create policy "Users can create orders" on public.orders for insert with check (auth.uid() = buyer_id);
create policy "Vendors can update orders for their shop" on public.orders for update using (exists (select 1 from public.shops where id = shop_id and owner_id = auth.uid()));

-- Order Items
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Vendors can view items for their shop orders" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert their own order items" ON public.order_items;

create policy "Users can view their own order items" on public.order_items for select using (exists (select 1 from public.orders where id = order_items.order_id and buyer_id = auth.uid()));
create policy "Vendors can view items for their shop orders" on public.order_items for select using (exists (select 1 from public.orders join public.shops on orders.shop_id = shops.id where orders.id = order_items.order_id and shops.owner_id = auth.uid()));
create policy "Users can insert their own order items" on public.order_items for insert with check (exists (select 1 from public.orders where id = order_id and buyer_id = auth.uid()));


-- ==========================================
-- 2. SETUP FUNCTIONS & TRIGGERS
-- ==========================================

-- Trigger to create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    CASE 
      WHEN new.email = 'baruck12@gmail.com' THEN 'admin'::public.user_role
      ELSE 'buyer'::public.user_role
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Secure function for Vendor Role Promotion
CREATE OR REPLACE FUNCTION public.become_vendor()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET role = 'vendor'
  WHERE id = auth.uid()
  AND role = 'buyer'; -- Only allow buyers to become vendors
END;
$$;
GRANT EXECUTE ON FUNCTION public.become_vendor TO authenticated;


-- ==========================================
-- 3. RESTORE MISSING PROFILES (Fix for existing users)
-- ==========================================

INSERT INTO public.profiles (id, full_name, role)
SELECT 
  id, 
  raw_user_meta_data->>'full_name',
  CASE 
      WHEN email = 'baruck12@gmail.com' THEN 'admin'::public.user_role
      ELSE 'buyer'::public.user_role
  END
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
