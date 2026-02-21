-- Full Schema Script
-- Run this to create the full database schema from scratch

-- 1. Create Enum Types (if not exist)
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

-- 2. Create Tables

-- Profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  role public.user_role default 'buyer'::public.user_role,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

-- Shops
create table if not exists public.shops (
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

alter table public.shops enable row level security;

-- Products
create table if not exists public.products (
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

alter table public.products enable row level security;

-- Orders
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references public.profiles(id),
  shop_id uuid references public.shops(id),
  total_price numeric not null,
  payment_method text,
  status public.order_status default 'pending'::public.order_status,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;

-- Order Items
create table if not exists public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id),
  quantity integer not null,
  price numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.order_items enable row level security;

-- Shop Reviews
create table if not exists public.shop_reviews (
  id uuid default gen_random_uuid() primary key,
  shop_id uuid references public.shops(id) on delete cascade not null,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  order_id uuid references public.orders(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (order_id) -- One review per order
);

alter table public.shop_reviews enable row level security;

-- System Settings
create table if not exists public.system_settings (
  key text primary key,
  value jsonb not null
);

alter table public.system_settings enable row level security;

-- Vendor Subscriptions
create table if not exists public.vendor_subscriptions (
  shop_id uuid references public.shops(id) on delete cascade not null primary key,
  expires_at timestamp with time zone not null,
  tier text default 'standard',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.vendor_subscriptions enable row level security;

-- Subscription Payments
create table if not exists public.subscription_payments (
  id uuid default gen_random_uuid() primary key,
  shop_id uuid references public.shops(id) on delete cascade not null,
  amount numeric not null,
  payment_reference text unique not null,
  status text default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.subscription_payments enable row level security;

-- 3. RLS Policies

-- Drop existing policies first to ensure clean state
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

DROP POLICY IF EXISTS "Admins can view all shops" ON public.shops;
DROP POLICY IF EXISTS "Admins can update all shops" ON public.shops;
DROP POLICY IF EXISTS "Admins can delete shops" ON public.shops;
DROP POLICY IF EXISTS "Shops are viewable by everyone." ON public.shops;
DROP POLICY IF EXISTS "Vendors can insert their own shop." ON public.shops;
DROP POLICY IF EXISTS "Vendors can update own shop." ON public.shops;

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Products are viewable by everyone." ON public.products;
DROP POLICY IF EXISTS "Vendors can insert products to own shop." ON public.products;
DROP POLICY IF EXISTS "Vendors can update own products." ON public.products;

-- Create Policies

-- Profiles
create policy "Admins can view all profiles" on public.profiles
  for select using ((select role from public.profiles where id = auth.uid()) = 'admin');

create policy "Admins can update all profiles" on public.profiles
  for update using ((select role from public.profiles where id = auth.uid()) = 'admin');

create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Shops
create policy "Admins can view all shops" on public.shops
  for select using ((select role from public.profiles where id = auth.uid()) = 'admin');

create policy "Admins can update all shops" on public.shops
  for update using ((select role from public.profiles where id = auth.uid()) = 'admin');

create policy "Admins can delete shops" on public.shops
  for delete using ((select role from public.profiles where id = auth.uid()) = 'admin');

create policy "Shops are viewable by everyone." on public.shops for select using (true);
create policy "Vendors can insert their own shop." on public.shops for insert with check (auth.uid() = owner_id);
create policy "Vendors can update own shop." on public.shops for update using (auth.uid() = owner_id);

-- Products
create policy "Admins can delete products" on public.products
  for delete using ((select role from public.profiles where id = auth.uid()) = 'admin');

create policy "Products are viewable by everyone." on public.products for select using (true);
create policy "Vendors can insert products to own shop." on public.products for insert with check (
   exists (select 1 from public.shops where id = shop_id and owner_id = auth.uid())
);
create policy "Vendors can update own products." on public.products for update using (
   exists (select 1 from public.shops where id = shop_id and owner_id = auth.uid())
);

-- Orders
create policy "Users can view their own orders" on public.orders for select using (auth.uid() = buyer_id);
create policy "Vendors can view orders for their shop" on public.orders for select using (
    exists (select 1 from public.shops where id = shop_id and owner_id = auth.uid())
);
create policy "Users can create orders" on public.orders for insert with check (auth.uid() = buyer_id);
create policy "Vendors can update orders for their shop" on public.orders for update using (
    exists (select 1 from public.shops where id = shop_id and owner_id = auth.uid())
);

-- Order Items
create policy "Users can view their own order items" on public.order_items for select using (
  exists (select 1 from public.orders where id = order_items.order_id and buyer_id = auth.uid())
);
create policy "Vendors can view items for their shop orders" on public.order_items for select using (
  exists (
    select 1 from public.orders
    join public.shops on orders.shop_id = shops.id
    where orders.id = order_items.order_id and shops.owner_id = auth.uid()
  )
);
create policy "Users can insert their own order items" on public.order_items for insert with check (
  exists (select 1 from public.orders where id = order_id and buyer_id = auth.uid())
);

-- Shop Reviews
create policy "Shop reviews are viewable by everyone" on public.shop_reviews for select using (true);
create policy "Buyers can insert review for their completed order" on public.shop_reviews for insert with check (
  auth.uid() = buyer_id and
  exists (
    select 1 from public.orders 
    where id = order_id 
      and buyer_id = auth.uid() 
      and shop_id = shop_reviews.shop_id 
      and status = 'completed'
  )
);

-- System Settings
create policy "System settings are viewable by everyone" on public.system_settings for select using (true);
create policy "Admins can update system settings" on public.system_settings for update using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- Vendor Subscriptions
create policy "Vendor subscriptions viewable by everyone" on public.vendor_subscriptions for select using (true);
create policy "Admins can update subscriptions" on public.vendor_subscriptions for update using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- Subscription Payments
create policy "Vendors can view own payments" on public.subscription_payments for select using (
  exists (select 1 from public.shops where id = shop_id and owner_id = auth.uid())
);
create policy "Admins can view all payments" on public.subscription_payments for select using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- 4. Triggers and Functions

-- Handle New User
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    'buyer'::public.user_role
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid error
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Secure function for Vendor Promotion
create or replace function public.become_vendor()
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles
  set role = 'vendor'
  where id = auth.uid()
  and role = 'buyer'; -- Only allow buyers to become vendors
end;
$$;

-- Grant execute to authenticated
grant execute on function public.become_vendor to authenticated;

-- Process Subscription Payment RPC
create or replace function public.process_subscription_payment(
  p_shop_id uuid,
  p_amount numeric,
  p_reference text,
  p_days int default 30
)
returns void
language plpgsql
security definer
as $$
declare
  v_expires_at timestamp with time zone;
begin
  -- 1. Insert payment (will fail if p_reference already exists due to unique constraint)
  insert into public.subscription_payments (shop_id, amount, payment_reference)
  values (p_shop_id, p_amount, p_reference);

  -- 2. Determine new expiration date
  select expires_at into v_expires_at from public.vendor_subscriptions where shop_id = p_shop_id;
  
  if v_expires_at is null then
    v_expires_at := now() + (p_days || ' days')::interval;
    insert into public.vendor_subscriptions (shop_id, expires_at) values (p_shop_id, v_expires_at);
  else
    if v_expires_at > now() then
      v_expires_at := v_expires_at + (p_days || ' days')::interval;
    else
      v_expires_at := now() + (p_days || ' days')::interval;
    end if;
    update public.vendor_subscriptions set expires_at = v_expires_at where shop_id = p_shop_id;
  end if;
end;
$$;
