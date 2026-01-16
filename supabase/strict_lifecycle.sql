-- ENFORCE STRICT SHOP LIFECYCLE RLS POLICIES
-- This script does NOT delete any data. It safely updates rules.

-- 0. SAFE MIGRATION: Keep existing shops working
-- Since we just added the 'status' column (defaulting to 'pending'), 
-- we must set existing shops to 'approved' so they don't disappear 
-- when we enable the strict visibility rules below.
UPDATE public.shops 
SET status = 'approved', is_verified = true 
WHERE status = 'pending'; 

-- 1. Create Enum Types (Ensure they exist)
DO $$ BEGIN
    CREATE TYPE public.shop_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. PRODUCTS: Visibility and Upload Restrictions

-- A. Public Visibility (SELECT)
-- REQUIREMENT: "Products are not searchable... not purchasable" if suspended.
-- IMPLEMENTATION: Only allow SELECT if the shop is 'approved'.
DROP POLICY IF EXISTS "Products are viewable by everyone." ON public.products;
DROP POLICY IF EXISTS "Products are viewable by everyone if shop is approved" ON public.products;
CREATE POLICY "Products are viewable by everyone if shop is approved" ON public.products
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.shops 
    WHERE shops.id = products.shop_id 
    AND shops.status = 'approved'
  )
);

-- B. Vendor Upload Rules (INSERT)
-- REQUIREMENT: "Shops cannot upload products unless their status is Approved AND Active."
DROP POLICY IF EXISTS "Vendors can insert products to own shop." ON public.products;
DROP POLICY IF EXISTS "Vendors can insert products to own APPROVED shop" ON public.products;
CREATE POLICY "Vendors can insert products to own APPROVED shop" ON public.products
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.shops 
    WHERE shops.id = shop_id 
    AND shops.owner_id = auth.uid()
    AND shops.status = 'approved' -- Strict Check
  )
);

-- C. Vendor Update Rules (UPDATE)
-- Vendors can update products only if shop is verified/approved
DROP POLICY IF EXISTS "Vendors can update own products." ON public.products;
DROP POLICY IF EXISTS "Vendors can update own products if shop is approved" ON public.products;
CREATE POLICY "Vendors can update own products if shop is approved" ON public.products
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.shops 
    WHERE shops.id = shop_id 
    AND shops.owner_id = auth.uid()
    AND shops.status = 'approved' -- Strict Check
  )
);

-- D. Admin Delete (Keep existing)
-- (We assume existing policy "Admins can delete products" is fine)


-- 3. SHOPS: Status Management Enforced on Backend

-- A. Vendor Registration (INSERT)
-- REQUIREMENT: "When a shop registers, its initial status must be Pending."
DROP POLICY IF EXISTS "Vendors can insert their own shop." ON public.shops;
DROP POLICY IF EXISTS "Vendors can register shop (starts as pending)" ON public.shops;
CREATE POLICY "Vendors can register shop (starts as pending)" ON public.shops
FOR INSERT WITH CHECK (
  auth.uid() = owner_id 
  AND status = 'pending' -- Must match default
);

-- B. User/Vendor Access (SELECT)
-- Vendors need to see their own shop regardless of status to see "Rejected" or "Suspended" message.
DROP POLICY IF EXISTS "Shops are viewable by everyone." ON public.shops;
DROP POLICY IF EXISTS "Public can view APPROVED shops" ON public.shops;
CREATE POLICY "Public can view APPROVED shops" ON public.shops
FOR SELECT USING (
  status = 'approved'
);

DROP POLICY IF EXISTS "Vendors can view OWN shop always" ON public.shops;
CREATE POLICY "Vendors can view OWN shop always" ON public.shops
FOR SELECT USING (
  auth.uid() = owner_id
);

DROP POLICY IF EXISTS "Admins can view ALL shops" ON public.shops;
CREATE POLICY "Admins can view ALL shops" ON public.shops
FOR SELECT USING (
  (select role from public.profiles where id = auth.uid()) = 'admin'
);

-- C. Update Rules
-- REQUIREMENT: "Admin must be able to change shop status... Direct API calls must not bypass."
DROP POLICY IF EXISTS "Vendors can update own shop." ON public.shops;
DROP POLICY IF EXISTS "Vendors can update own shop details (NOT status)" ON public.shops;
CREATE POLICY "Vendors can update own shop details (NOT status)" ON public.shops
FOR UPDATE USING (
  auth.uid() = owner_id
)
WITH CHECK (
  auth.uid() = owner_id
);

-- D. Admin Update Policy
-- REQUIREMENT: Admins must be able to update ANY shop (for status changes)
DROP POLICY IF EXISTS "Admins can update ANY shop" ON public.shops;
CREATE POLICY "Admins can update ANY shop" ON public.shops
FOR UPDATE USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 4. PREVENT STATUS HIJACKING TRIGGER
CREATE OR REPLACE FUNCTION public.prevent_vendor_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If the user is NOT an admin, and they try to change the status
  IF (NEW.status IS DISTINCT FROM OLD.status) THEN
    IF (SELECT role FROM public.profiles WHERE id = auth.uid()) != 'admin' THEN
       RAISE EXCEPTION 'Only admins can change shop status.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS protect_shop_status ON public.shops;
CREATE TRIGGER protect_shop_status
BEFORE UPDATE ON public.shops
FOR EACH ROW EXECUTE FUNCTION public.prevent_vendor_status_change();


-- 5. ORDERS RESTRICTIONS (Optional but recommended)
-- REQUIREMENT: "Orders cannot be placed" if suspended.
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders for APPROVED shops only" ON public.orders;
CREATE POLICY "Users can create orders for APPROVED shops only" ON public.orders
FOR INSERT WITH CHECK (
  auth.uid() = buyer_id
  AND EXISTS (
    SELECT 1 FROM public.shops 
    WHERE shops.id = shop_id 
    AND shops.status = 'approved'
  )
);
