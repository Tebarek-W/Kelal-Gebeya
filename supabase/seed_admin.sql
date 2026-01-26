-- Seed Admin User
-- This script creates/updates an admin user in Supabase Auth.
-- Run this in the Supabase SQL Editor.

-- 1. Enable pgcrypto if not enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Variables for user details
DO $$
DECLARE
    new_user_id UUID := gen_random_uuid();
    admin_email TEXT := 'admin@kelalgebeya.com';
    admin_pass TEXT := 'admin1';
    -- hashing using crypt and gen_salt with standard bcrypt settings
    hashed_pass TEXT := extensions.crypt('admin1', extensions.gen_salt('bf', 10));
BEGIN
    -- 3. Check if user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            aud,
            role,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            created_at,
            updated_at,
            last_sign_in_at,
            confirmation_token,
            recovery_token,
            email_change_token_new,
            email_change
        )
        VALUES (
            new_user_id,
            '00000000-0000-0000-0000-000000000000',
            admin_email,
            hashed_pass,
            now(),
            'authenticated',
            'authenticated',
            '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "System Admin"}',
            false,
            now(),
            now(),
            now(),
            '',
            '',
            '',
            ''
        );

        -- Insert/Update Profile
        INSERT INTO public.profiles (id, full_name, role)
        VALUES (new_user_id, 'System Admin', 'admin'::public.user_role)
        ON CONFLICT (id) DO UPDATE 
        SET role = 'admin'::public.user_role,
            full_name = 'System Admin';

        RAISE NOTICE 'Admin user created successfully: %', admin_email;
    ELSE
        -- Update existing user setup for safety
        UPDATE auth.users 
        SET encrypted_password = hashed_pass,
            email_confirmed_at = now(),
            aud = 'authenticated',
            role = 'authenticated',
            updated_at = now()
        WHERE email = admin_email;

        -- Ensure profile matches
        UPDATE public.profiles 
        SET role = 'admin'::public.user_role,
            full_name = 'System Admin'
        WHERE id = (SELECT id FROM auth.users WHERE email = admin_email);
        
        RAISE NOTICE 'Admin user updated successfully: %', admin_email;
    END IF;
END $$;
