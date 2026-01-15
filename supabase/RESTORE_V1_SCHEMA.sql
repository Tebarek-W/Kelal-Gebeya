-- RESTORE ORIGINAL SCHEMA (System Reset)
-- This script wipes the database and restores the state BEFORE the Admin System changes.

-- 1. DROP EVERYTHING
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.become_vendor(); -- Drop the RPC function we added

DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.shops CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.order_status;
DROP TYPE IF EXISTS public.shop_status; -- This enum was added in the admin update

-- 2. RECREATE ORIGINAL ENUMS
create type public.user_role as enum ('buyer', 'vendor', 'admin');
create type public.order_status as enum ('pending', 'processing', 'completed');
-- shop_status is NOT created as it wasn't in the original schema

-- 3. RECREATE ORIGINAL TABLES

-- Profiles
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  role public.user_role default 'buyer'::public.user_role,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Shops (Original structure: No status, no verification, no admin_notes)
create table public.shops (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  logo_url text,
  banner_url text,
  contact_phone text,
  address text,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.shops enable row level security;
create policy "Shops are viewable by everyone." on public.shops for select using (true);
create policy "Vendors can insert their own shop." on public.shops for insert with check (auth.uid() = owner_id);
create policy "Vendors can update own shop." on public.shops for update using (auth.uid() = owner_id);

-- Products
create table public.products (
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
create policy "Products are viewable by everyone." on public.products for select using (true);
create policy "Vendors can insert products to own shop." on public.products for insert with check (
   exists (select 1 from public.shops where id = shop_id and owner_id = auth.uid())
);
create policy "Vendors can update own products." on public.products for update using (
   exists (select 1 from public.shops where id = shop_id and owner_id = auth.uid())
);

-- Orders
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references public.profiles(id),
  shop_id uuid references public.shops(id),
  total_price numeric not null,
  payment_method text,
  status public.order_status default 'pending'::public.order_status,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;
create policy "Users can view their own orders" on public.orders for select using (auth.uid() = buyer_id);
create policy "Vendors can view orders for their shop" on public.orders for select using (
    exists (select 1 from public.shops where id = shop_id and owner_id = auth.uid())
);
create policy "Users can create orders" on public.orders for insert with check (auth.uid() = buyer_id);
create policy "Vendors can update orders for their shop" on public.orders for update using (
    exists (select 1 from public.shops where id = shop_id and owner_id = auth.uid())
);

-- Order Items
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id),
  quantity integer not null,
  price numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.order_items enable row level security;
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

-- 4. RESTORE ORIGINAL TRIGGER
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'buyer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. RE-SYNC PROFILES (To restore data for existing auth users)
insert into public.profiles (id, full_name, role)
select 
  id, 
  raw_user_meta_data->>'full_name', 
  'buyer'::public.user_role -- Reset everyone to buyer initially
from auth.users
where id not in (select id from public.profiles);

-- 6. GRANT PERMISSIONS TO BE SAFE
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
