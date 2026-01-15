-- FIX SCRIPT: Sync Profiles with Auth Users
-- Run this to fix "foreign key constraint" errors for existing users

insert into public.profiles (id, full_name, role)
select 
  id, 
  raw_user_meta_data->>'full_name',
  case 
      when email = 'baruck12@gmail.com' then 'admin'::public.user_role
      else 'buyer'::public.user_role
  end
from auth.users
where id not in (select id from public.profiles);

-- Output result
select count(*) as "Profiles Created" from public.profiles;
