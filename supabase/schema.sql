-- Create Enum Types
create type public.user_role as enum ('buyer', 'vendor', 'admin');
create type public.order_status as enum ('pending', 'processing', 'completed');

-- Create Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  role public.user_role default 'buyer'::public.user_role,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Create Shops Table
create table public.shops (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  logo_url text,
  banner_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Shops
alter table public.shops enable row level security;
create policy "Shops are viewable by everyone." on public.shops for select using (true);
create policy "Vendors can insert their own shop." on public.shops for insert with check (auth.uid() = owner_id);
create policy "Vendors can update own shop." on public.shops for update using (auth.uid() = owner_id);

-- Create Products Table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  shop_id uuid references public.shops(id) on delete cascade not null,
  name text not null,
  price numeric not null,
  images text[],
  stock integer default 0,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Products
alter table public.products enable row level security;
create policy "Products are viewable by everyone." on public.products for select using (true);
create policy "Vendors can insert products to own shop." on public.products for insert with check (
   exists (select 1 from public.shops where id = shop_id and owner_id = auth.uid())
);
create policy "Vendors can update own products." on public.products for update using (
   exists (select 1 from public.shops where id = shop_id and owner_id = auth.uid())
);

-- Create Orders Table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references public.profiles(id),
  shop_id uuid references public.shops(id),
  total_price numeric not null,
  status public.order_status default 'pending'::public.order_status,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Orders
alter table public.orders enable row level security;
create policy "Users can view their own orders" on public.orders for select using (auth.uid() = buyer_id);
create policy "Vendors can view orders for their shop" on public.orders for select using (
    exists (select 1 from public.shops where id = shop_id and owner_id = auth.uid())
);
create policy "Users can create orders" on public.orders for insert with check (auth.uid() = buyer_id);

-- Trigger to create profile on signup
-- Note: You might need to drop existing trigger/function if they exist
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
