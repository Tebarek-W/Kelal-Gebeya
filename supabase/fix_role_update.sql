-- Create a secure function to allow users to upgrade themselves to vendor
-- This is necessary because RLS policies might strictly limit role changes
-- to admins only, or generic update policies might be failing.

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

-- Grant execute permission to authenticated users
grant execute on function public.become_vendor to authenticated;
