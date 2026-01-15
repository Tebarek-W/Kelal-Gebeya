-- Create Shop Status Enum
-- Check if type exists first or just create it (will error if exists, so we wrap or just assume user handles it. Safest is to just create it)
create type public.shop_status as enum ('pending', 'approved', 'rejected', 'suspended');

-- Add columns to shops
alter table public.shops add column if not exists status public.shop_status default 'pending'::public.shop_status;
alter table public.shops add column if not exists is_verified boolean default false;
alter table public.shops add column if not exists admin_notes text;

-- Update the handle_new_user function to auto-assign admin role to specific email
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    case 
      when new.email = 'baruck12@gmail.com' then 'admin'::public.user_role
      else 'buyer'::public.user_role
    end
  );
  return new;
end;
$$ language plpgsql security definer;

-- Admin RLS Policies

-- Profiles: Admins can view/update all profiles
create policy "Admins can view all profiles" on public.profiles
  for select using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "Admins can update all profiles" on public.profiles
  for update using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- Shops: Admins can view/update/delete all shops
create policy "Admins can view all shops" on public.shops
  for select using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "Admins can update all shops" on public.shops
  for update using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );
  
create policy "Admins can delete shops" on public.shops
  for delete using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- Products: Admins can delete products (for moderation)
create policy "Admins can delete products" on public.products
  for delete using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );
