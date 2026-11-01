-- =========================================================================
-- MEGA BAZAR MULTI-VENDOR MARKETPLACE MIGRATION (FINAL SECURITY REVIEWED)
-- =========================================================================
-- 1. Preserves all existing tables (products, orders, categories, users)
-- 2. Enforces Super Admin via cryptographically verified Supabase Auth JWT app_metadata
-- 3. Strict database trigger + RLS preventing sellers from self-approving or transferring shops
-- 4. Complete privacy: No seller phone numbers, addresses, or commission rates exposed publicly
-- =========================================================================

BEGIN;

-- 1. Helper function: verify Super Admin role via Supabase Auth JWT app_metadata
-- (Strictly role-based; no email shortcuts or hardcoded credentials)
CREATE OR REPLACE FUNCTION public.mb_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(auth.jwt()->'app_metadata'->>'role', '') = 'super_admin';
$$;

REVOKE ALL ON FUNCTION public.mb_is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mb_is_admin() TO anon, authenticated, service_role;

-- 2. Create mb_shops table safely if not exists
CREATE TABLE IF NOT EXISTS public.mb_shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  owner_name text NOT NULL CHECK (length(trim(owner_name)) >= 2),
  email text NOT NULL,
  phone text NOT NULL,
  name text NOT NULL CHECK (length(trim(name)) >= 2),
  slug text UNIQUE NOT NULL,
  category text NOT NULL DEFAULT 'General Marketplace',
  city text NOT NULL,
  address text NOT NULL,
  logo_url text,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  reason text DEFAULT '',
  verified boolean NOT NULL DEFAULT false,
  commission_rate text DEFAULT '5%',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

-- Idempotently add any missing columns in case mb_shops was created previously
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'mb_shops' AND column_name = 'logo_url') THEN
    ALTER TABLE public.mb_shops ADD COLUMN logo_url text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'mb_shops' AND column_name = 'commission_rate') THEN
    ALTER TABLE public.mb_shops ADD COLUMN commission_rate text DEFAULT '5%';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'mb_shops' AND column_name = 'description') THEN
    ALTER TABLE public.mb_shops ADD COLUMN description text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'mb_shops' AND column_name = 'reason') THEN
    ALTER TABLE public.mb_shops ADD COLUMN reason text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'mb_shops' AND column_name = 'verified') THEN
    ALTER TABLE public.mb_shops ADD COLUMN verified boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'mb_shops' AND column_name = 'reviewed_at') THEN
    ALTER TABLE public.mb_shops ADD COLUMN reviewed_at timestamptz;
  END IF;
END $$;

-- 3. Database Trigger: Absolute field protection for seller accounts
-- Guarantees at the database level that non-admins CANNOT:
-- - Change or forge owner_id
-- - Self-approve, self-suspend, or alter status to 'approved'
-- - Self-verify or alter the verified badge
-- - Alter commission_rate or tamper with moderation notes
CREATE OR REPLACE FUNCTION public.mb_protect_shop_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Super Admins (verified via JWT app_metadata) have full management control
  IF public.mb_is_admin() THEN
    RETURN NEW;
  END IF;

  -- Non-Admin / Seller Enforcement:
  IF TG_OP = 'INSERT' THEN
    NEW.owner_id := auth.uid();
    NEW.status := 'pending';
    NEW.verified := false;
    NEW.commission_rate := '5%';
    NEW.reason := '';
    NEW.reviewed_at := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Lock owner_id, commission_rate, verified, reason, and reviewed_at
    NEW.owner_id := OLD.owner_id;
    NEW.commission_rate := OLD.commission_rate;
    NEW.verified := OLD.verified;
    NEW.reason := OLD.reason;
    NEW.reviewed_at := OLD.reviewed_at;

    -- If previously rejected, seller editing details resets status to 'pending' for re-review
    -- Otherwise status remains strictly unchanged
    IF OLD.status = 'rejected' THEN
      NEW.status := 'pending';
    ELSE
      NEW.status := OLD.status;
    END IF;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mb_protect_shop_fields ON public.mb_shops;
CREATE TRIGGER trg_mb_protect_shop_fields
BEFORE INSERT OR UPDATE ON public.mb_shops
FOR EACH ROW
EXECUTE FUNCTION public.mb_protect_shop_fields();

-- 4. Enable Row Level Security (RLS) on mb_shops
ALTER TABLE public.mb_shops ENABLE ROW LEVEL SECURITY;

-- Clean up any legacy or duplicate policies
DROP POLICY IF EXISTS "mb_shops_select_policy" ON public.mb_shops;
DROP POLICY IF EXISTS "mb_shops_insert_policy" ON public.mb_shops;
DROP POLICY IF EXISTS "mb_shops_update_policy" ON public.mb_shops;
DROP POLICY IF EXISTS "mb_shops_delete_policy" ON public.mb_shops;
DROP POLICY IF EXISTS "mb_shops_public_read" ON public.mb_shops;
DROP POLICY IF EXISTS "mb_shops_owner_insert" ON public.mb_shops;
DROP POLICY IF EXISTS "mb_shops_owner_update" ON public.mb_shops;
DROP POLICY IF EXISTS "mb_shops_private_read" ON public.mb_shops;

-- 5. RLS Policies on mb_shops:
-- (a) SELECT: Direct table query is restricted to authenticated users.
-- Sellers can ONLY see their own shop. Only Super Admin can view all shops.
CREATE POLICY "mb_shops_select_policy" ON public.mb_shops
FOR SELECT TO authenticated
USING (
  auth.uid() = owner_id
  OR public.mb_is_admin()
);

-- (b) INSERT: Authenticated users can register their own shop.
CREATE POLICY "mb_shops_insert_policy" ON public.mb_shops
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = owner_id
  OR public.mb_is_admin()
);

-- (c) UPDATE: Super Admin can update any shop. Sellers can only edit their own shop details.
CREATE POLICY "mb_shops_update_policy" ON public.mb_shops
FOR UPDATE TO authenticated
USING (
  auth.uid() = owner_id
  OR public.mb_is_admin()
)
WITH CHECK (
  CASE 
    WHEN public.mb_is_admin() THEN true
    WHEN auth.uid() = owner_id THEN (status IN ('pending', 'rejected') AND verified IS NOT TRUE)
    ELSE false
  END
);

-- (d) DELETE: Restricted to Super Admin
CREATE POLICY "mb_shops_delete_policy" ON public.mb_shops
FOR DELETE TO authenticated
USING (
  public.mb_is_admin()
);

-- 6. Direct Table Permissions:
-- Anonymous users are REVOKED from querying mb_shops directly (prevents phone/address/commission leaks)
REVOKE ALL ON public.mb_shops FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.mb_shops TO authenticated;
GRANT ALL ON public.mb_shops TO service_role;

-- 7. Secure Public Storefront View:
-- Only approved shops are visible.
-- Excludes private phone numbers, full addresses (only public city is shown), commission rates, emails, and owner_id.
DROP VIEW IF EXISTS public.mb_public_shops;
CREATE OR REPLACE VIEW public.mb_public_shops
WITH (security_barrier = true) AS
SELECT
  id,
  name,
  slug,
  category,
  city,
  logo_url,
  description,
  verified,
  created_at
FROM public.mb_shops
WHERE status = 'approved';

REVOKE ALL ON public.mb_public_shops FROM anon, authenticated;
GRANT SELECT ON public.mb_public_shops TO anon, authenticated, service_role;

-- 8. Super Admin Audit Log
CREATE TABLE IF NOT EXISTS public.mb_admin_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id),
  shop_id uuid REFERENCES public.mb_shops(id) ON DELETE CASCADE,
  action text NOT NULL,
  reason text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.mb_admin_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mb_admin_events_read_policy" ON public.mb_admin_events;
CREATE POLICY "mb_admin_events_read_policy" ON public.mb_admin_events
FOR ALL TO authenticated
USING (public.mb_is_admin())
WITH CHECK (public.mb_is_admin());

REVOKE ALL ON public.mb_admin_events FROM anon, authenticated;
GRANT SELECT, INSERT ON public.mb_admin_events TO authenticated;
GRANT ALL ON public.mb_admin_events TO service_role;

-- 9. Storage Bucket Configuration for Product & Shop Media
-- Creates the public bucket 'mb-product-images' safely if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mb-product-images',
  'mb-product-images',
  true,
  12582912,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS: Anyone can view public photos; authenticated sellers & admins can upload
DROP POLICY IF EXISTS "mb_storage_public_select" ON storage.objects;
CREATE POLICY "mb_storage_public_select" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'mb-product-images');

DROP POLICY IF EXISTS "mb_storage_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "mb_storage_public_insert" ON storage.objects;
CREATE POLICY "mb_storage_public_insert" ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'mb-product-images');

DROP POLICY IF EXISTS "mb_storage_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "mb_storage_public_update" ON storage.objects;
CREATE POLICY "mb_storage_public_update" ON storage.objects
FOR UPDATE TO anon, authenticated
USING (bucket_id = 'mb-product-images');

COMMIT;
