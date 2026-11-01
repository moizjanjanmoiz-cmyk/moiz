import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatPakistaniWhatsAppNumber, createWhatsAppLink, formatDate } from '@/lib/utils';
import { Product, SellerShop, Complaint, OrderStatus } from '@/lib/types';
import { isSupabaseConfigured, supabaseUrl } from '@/lib/supabase/client';
import {
  Lock,
  Package,
  FolderTree,
  ShoppingBag,
  Star,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Eye,
  EyeOff,
  LogOut,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Crown,
  Store,
  DollarSign,
  Phone,
  MessageCircle,
  Clock,
  UserCheck,
  Sliders,
  Wallet,
  CheckCircle2,
  XCircle,
  Users,
  Search,
  Tag,
  Flame,
  ShieldAlert,
  BarChart3,
  Copy,
  Layers,
  Upload,
  Loader2,
} from 'lucide-react';
import { uploadImageToSupabase } from '@/lib/supabase/storage';

type AdminTab =
  | 'overview'
  | 'shops'
  | 'sellers'
  | 'products'
  | 'orders'
  | 'customers'
  | 'finance'
  | 'complaints'
  | 'categories'
  | 'marketing'
  | 'reports'
  | 'settings';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    categories,
    orders,
    reviews,
    shops,
    complaints,
    settings,
    user,
    isAdminAuthenticated,
    logoutAdmin,
    createProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    updateSettings,
    approveShop,
    rejectShop,
    suspendShop,
    reactivateShop,
    updateComplaintStatus,
    coupons,
    banners,
    refreshOrders,
    refreshProducts,
    refreshShops,
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Filter states
  const [shopStatusFilter, setShopStatusFilter] = useState<'all' | 'Pending' | 'Approved' | 'Rejected' | 'Suspended'>('all');
  const [productSearch, setProductSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [complaintFilter, setComplaintFilter] = useState<string>('all');

  // Rejection modal state
  const [rejectingShop, setRejectingShop] = useState<SellerShop | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Edit / Add product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isAdminImageUploading, setIsAdminImageUploading] = useState(false);
  const [adminImageError, setAdminImageError] = useState('');

  const handleAdminProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;
    setIsAdminImageUploading(true);
    setAdminImageError('');
    try {
      const res = await uploadImageToSupabase(file, {
        bucket: 'mb-product-images',
        folder: 'catalog-products',
        maxSizeMB: 10,
      });
      if (res.success && res.url) {
        setEditingProduct({
          ...editingProduct,
          images: [res.url, ...(editingProduct.images?.slice(1) || [])],
        });
        if (res.isFallback && res.error) {
          setAdminImageError(res.error);
        }
      } else {
        setAdminImageError(res.error || 'Failed to upload photo.');
      }
    } catch (err: any) {
      setAdminImageError(err.message || 'Image upload error.');
    } finally {
      setIsAdminImageUploading(false);
    }
  };

  // Settings form state
  const [storeName, setStoreName] = useState(settings.storeName || 'Mega Bazar');
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber || '923182204441');
  const [standardShipping, setStandardShipping] = useState(settings.standardShippingFee || 250);
  const [freeShipping, setFreeShipping] = useState(settings.freeShippingThreshold || 5000);
  const [easypaisaName, setEasypaisaName] = useState(settings.easypaisaAccountName || 'Muhammad Moiz');
  const [easypaisaNo, setEasypaisaNo] = useState(settings.easypaisaAccountNumber || '03182204441');
  const [jazzcashName, setJazzcashName] = useState(settings.jazzcashAccountName || 'MOIZ.S');
  const [jazzcashTill, setJazzcashTill] = useState(settings.jazzcashTillId || '984488781');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showSettingsPassword, setShowSettingsPassword] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Calculated metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'Pending').length;
  const pendingShopsCount = shops.filter((s) => s.status === 'Pending').length;
  const openComplaintsCount = complaints.filter((c) => c.status === 'Open' || c.status === 'Investigating').length;

  const isSuperAdmin =
    isAdminAuthenticated &&
    (user?.role === 'super_admin' || user?.role === 'admin');

  // Strict Super Admin Access Guard
  if (!isSuperAdmin) {
    return (
      <div className="py-16 sm:py-24 bg-slate-950 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-7 sm:p-9 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Lock size={30} />
          </div>
          <div className="inline-block px-3 py-1 bg-rose-100 text-rose-900 text-[11px] font-black uppercase tracking-wider rounded-full">
            403 · RESTRICTED SUPER ADMIN PORTAL
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Super Admin Access Required</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            This dashboard is exclusively accessible to the platform owner (<b>Muhammad Moiz</b>). Regular customers and unauthorized visitors cannot access this control panel.
          </p>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 text-left">
            <p className="font-bold text-slate-800">Authorized Super Admin Identity:</p>
            <div className="flex justify-between items-center text-slate-600">
              <span>Owner Email:</span>
              <span className="font-mono font-bold text-blue-600">moizziom84@gmail.com</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Access Level:</span>
              <span className="font-bold text-emerald-600">Platform Owner / Super Administrator</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href="/login"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              Sign In via Secure Login Page →
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors block text-center"
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: Partial<typeof settings> = {
      storeName,
      whatsappNumber,
      standardShippingFee: Number(standardShipping),
      freeShippingThreshold: Number(freeShipping),
      easypaisaAccountName: easypaisaName,
      easypaisaAccountNumber: easypaisaNo,
      jazzcashAccountName: jazzcashName,
      jazzcashTillId: jazzcashTill,
    };
    if (adminPasswordInput.trim()) {
      updates.adminPassword = adminPasswordInput.trim();
    }
    updateSettings(updates);
    setSettingsSaved(true);
    setAdminPasswordInput('');
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleConfirmReject = () => {
    if (!rejectingShop) return;
    rejectShop(rejectingShop.id, rejectionReasonInput.trim() || 'Incomplete shop details or phone unverified.');
    setRejectingShop(null);
    setRejectionReasonInput('');
  };

  const openNewProduct = () => {
    setEditingProduct({
      id: `prod-${Date.now()}`,
      name: '',
      category: categories[0]?.name || 'Fashion',
      price: 1500,
      originalPrice: 2000,
      stock: 25,
      brand: 'Mega Bazar',
      description: 'High quality genuine product with fast nationwide dispatch across Pakistan.',
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'],
      status: 'active',
      isFeatured: false,
      isFlashDeal: false,
      rating: 5,
      reviewCount: 0,
      tags: ['New Arrival'],
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;
    const prodData = {
      ...editingProduct,
      price: Number(editingProduct.price || 0),
      originalPrice: Number(editingProduct.originalPrice || editingProduct.price || 0),
      stock: Number(editingProduct.stock || 0),
      discountPercentage: Math.round(
        (((editingProduct.originalPrice || 0) - (editingProduct.price || 0)) / (editingProduct.originalPrice || 1)) * 100
      ),
    } as Product;

    if (editingProduct.id && products.some((p) => p.id === editingProduct.id)) {
      updateProduct(editingProduct.id, prodData);
    } else {
      createProduct(prodData);
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  // Filtered Shops
  const filteredShops = shops.filter((s) => {
    if (shopStatusFilter === 'all') return true;
    return s.status === shopStatusFilter;
  });

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    );
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    return o.orderStatus === orderStatusFilter;
  });

  // Filtered Complaints
  const filteredComplaints = complaints.filter((c) => {
    if (complaintFilter === 'all') return true;
    return c.status === complaintFilter;
  });

  // Extract unique customers from real orders and profiles
  const customerMap = new Map<string, { name: string; email: string; phone: string; city: string; orderCount: number; totalSpent: number }>();
  orders.forEach((o) => {
    const key = o.email || o.phone || o.customerName;
    const existing = customerMap.get(key);
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += o.grandTotal || 0;
    } else {
      customerMap.set(key, {
        name: o.customerName || 'Customer',
        email: o.email || 'customer@megabazar.pk',
        phone: o.phone || '03182204441',
        city: o.shippingAddress?.city || 'Pakistan',
        orderCount: 1,
        totalSpent: o.grandTotal || 0,
      });
    }
  });
  const customerList = Array.from(customerMap.values());

  const sqlMigrationCode = `-- =========================================================================
-- MEGA BAZAR MULTI-VENDOR MARKETPLACE MIGRATION (FINAL SECURITY REVIEWED)
-- =========================================================================
-- 1. Preserves all existing tables (products, orders, categories, users)
-- 2. Enforces Super Admin via cryptographically verified Supabase Auth JWT app_metadata
-- 3. Strict database trigger + RLS preventing sellers from self-approving or transferring shops
-- 4. Complete privacy: No seller phone numbers, addresses, or commission rates exposed publicly
-- =========================================================================

BEGIN;

-- 1. Helper function: verify Super Admin role via Supabase Auth JWT app_metadata
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
CREATE OR REPLACE FUNCTION public.mb_protect_shop_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF public.mb_is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.owner_id := auth.uid();
    NEW.status := 'pending';
    NEW.verified := false;
    NEW.commission_rate := '5%';
    NEW.reason := '';
    NEW.reviewed_at := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.owner_id := OLD.owner_id;
    NEW.commission_rate := OLD.commission_rate;
    NEW.verified := OLD.verified;
    NEW.reason := OLD.reason;
    NEW.reviewed_at := OLD.reviewed_at;

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

DROP POLICY IF EXISTS "mb_shops_select_policy" ON public.mb_shops;
DROP POLICY IF EXISTS "mb_shops_insert_policy" ON public.mb_shops;
DROP POLICY IF EXISTS "mb_shops_update_policy" ON public.mb_shops;
DROP POLICY IF EXISTS "mb_shops_delete_policy" ON public.mb_shops;
DROP POLICY IF EXISTS "mb_shops_public_read" ON public.mb_shops;
DROP POLICY IF EXISTS "mb_shops_owner_insert" ON public.mb_shops;
DROP POLICY IF EXISTS "mb_shops_owner_update" ON public.mb_shops;
DROP POLICY IF EXISTS "mb_shops_private_read" ON public.mb_shops;

-- 5. RLS Policies on mb_shops:
CREATE POLICY "mb_shops_select_policy" ON public.mb_shops
FOR SELECT TO authenticated
USING (
  auth.uid() = owner_id
  OR public.mb_is_admin()
);

CREATE POLICY "mb_shops_insert_policy" ON public.mb_shops
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = owner_id
  OR public.mb_is_admin()
);

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

CREATE POLICY "mb_shops_delete_policy" ON public.mb_shops
FOR DELETE TO authenticated
USING (
  public.mb_is_admin()
);

-- 6. Direct Table Permissions:
REVOKE ALL ON public.mb_shops FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.mb_shops TO authenticated;
GRANT ALL ON public.mb_shops TO service_role;

-- 7. Secure Public Storefront View:
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

COMMIT;
`;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Super Header with Owner Identity */}
      <header className="bg-slate-950 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Crown size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-white">Mega Bazar Platform Owner Suite</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
                  Verified Owner
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Muhammad Moiz · <span className="text-slate-300">moizziom84@gmail.com</span> · +92 318 2204441
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 flex items-center gap-1 font-bold transition-all"
            >
              <ExternalLink size={13} /> Public Store
            </Link>
            <button
              onClick={logoutAdmin}
              className="flex items-center gap-1 px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg font-bold transition-all cursor-pointer"
            >
              <LogOut size={13} /> Exit Session
            </button>
          </div>
        </div>

        {/* Tab Navigation — All 12 Sections */}
        <div className="border-t border-slate-800 bg-slate-900/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto py-1.5 scrollbar-thin">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'shops', label: `Shops (${shops.length})`, icon: Store, badge: pendingShopsCount > 0 ? `${pendingShopsCount} New` : undefined },
              { id: 'sellers', label: `Sellers (${shops.length})`, icon: UserCheck },
              { id: 'products', label: `Products (${products.length})`, icon: Package },
              { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag, badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} Pending` : undefined },
              { id: 'customers', label: `Customers (${customerList.length})`, icon: Users },
              { id: 'finance', label: 'Payments & Commission', icon: Wallet },
              { id: 'complaints', label: `Complaints (${complaints.length})`, icon: ShieldAlert, badge: openComplaintsCount > 0 ? `${openComplaintsCount}` : undefined },
              { id: 'categories', label: `Categories (${categories.length})`, icon: FolderTree },
              { id: 'marketing', label: 'Marketing & Promos', icon: Flame },
              { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
              { id: 'settings', label: 'Settings & Security', icon: Settings },
            ].map(({ id, label, icon: Icon, badge }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as AdminTab)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} />
                <span>{label}</span>
                {badge && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black">
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* SECTION 1: DASHBOARD OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Owner Welcome Card */}
            <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
              <div className="relative z-10 flex flex-wrap justify-between items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                    👑 PLATFORM OWNER CONSOLE
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black">Welcome, Muhammad Moiz!</h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                    You have complete control over all seller shops, product approvals, customer orders, and commission settings across Mega Bazar Pakistan.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={openNewProduct}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus size={15} /> Add New Product
                  </button>
                  <button
                    onClick={() => setActiveTab('shops')}
                    className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Store size={15} /> Review Shops ({pendingShopsCount} Pending)
                  </button>
                </div>
              </div>
            </div>

            {/* Pending Approvals Alert Banner */}
            {pendingShopsCount > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-amber-600 shrink-0" />
                  <div className="text-xs text-amber-950">
                    <strong>{pendingShopsCount} new seller application(s) pending your approval.</strong>
                    <p className="text-amber-800">Review shop name, phone number, and city to activate their public storefronts.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShopStatusFilter('Pending');
                    setActiveTab('shops');
                  }}
                  className="px-3 py-1.5 bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-2xs hover:bg-amber-300 shrink-0 cursor-pointer"
                >
                  Review Pending →
                </button>
              </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-500">Gross Sales Volume</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">
                  {formatCurrency(totalRevenue, settings.currency)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">From all customer orders</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-500">Active Marketplace Shops</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{shops.length}</p>
                <p className="text-[11px] text-blue-600 font-semibold mt-1">
                  {shops.filter((s) => s.status === 'Approved').length} Approved &amp; Live
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-500">Total Products Live</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{products.length}</p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  Across 24+ categories
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-500">Total Customer Orders</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{orders.length}</p>
                <p className="text-[11px] text-amber-600 font-semibold mt-1">
                  {pendingOrdersCount} Pending fulfillment
                </p>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-black text-base text-slate-900">Recent Customer Orders</h3>
                  <p className="text-xs text-slate-500">Synced directly with Supabase orders table</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  View All Orders ({orders.length}) →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                      <th className="pb-3">Order Number</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">City</th>
                      <th className="pb-3">Total Amount</th>
                      <th className="pb-3">Payment</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id}>
                        <td className="py-3 font-mono font-bold text-blue-600">{o.orderNumber}</td>
                        <td className="py-3 font-semibold text-slate-900">{o.customerName}</td>
                        <td className="py-3 text-slate-600">{o.shippingAddress?.city || 'Pakistan'}</td>
                        <td className="py-3 font-bold text-slate-900">{formatCurrency(o.grandTotal, settings.currency)}</td>
                        <td className="py-3 uppercase font-semibold text-slate-700">{o.paymentMethod}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              o.orderStatus === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : o.orderStatus === 'Shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {o.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: SHOP MANAGEMENT */}
        {activeTab === 'shops' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">Multi-Vendor Shop Management</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Approve, reject with reason, suspend, or reactivate seller storefronts across Pakistan.
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
                {(['all', 'Pending', 'Approved', 'Rejected', 'Suspended'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setShopStatusFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      shopStatusFilter === filter
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {filter === 'all' ? 'All Shops' : filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Shop Name &amp; URL</th>
                      <th className="py-3.5 px-4">Owner &amp; WhatsApp</th>
                      <th className="py-3.5 px-4">Category &amp; City</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Owner Control Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredShops.map((shop) => (
                      <tr key={shop.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-slate-200 flex items-center justify-center text-blue-600 font-bold overflow-hidden shrink-0">
                              {shop.logoUrl ? (
                                <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
                              ) : (
                                <Store size={18} />
                              )}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-900">{shop.name}</p>
                              <Link
                                href={`/shop/${shop.slug}`}
                                className="text-[11px] font-mono text-blue-600 hover:underline flex items-center gap-1"
                              >
                                /shop/{shop.slug} <ExternalLink size={10} />
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-800">{shop.ownerName}</p>
                          <a
                            href={createWhatsAppLink(shop.phone, `Hello ${shop.ownerName}! This is Mega Bazar Admin.`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-mono text-emerald-600 hover:underline flex items-center gap-1"
                          >
                            <MessageCircle size={11} /> +{shop.phone}
                          </a>
                          <p className="text-[10px] text-slate-400">{shop.email}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-700">{shop.category}</p>
                          <p className="text-[11px] text-slate-400">{shop.city}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-xs">{shop.address}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <div>
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                shop.status === 'Approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : shop.status === 'Pending'
                                  ? 'bg-amber-100 text-amber-900'
                                  : shop.status === 'Suspended'
                                  ? 'bg-purple-100 text-purple-900'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {shop.status}
                            </span>
                            {shop.rejectionReason && (
                              <p className="text-[10px] text-rose-600 mt-1 max-w-xs">
                                Reason: {shop.rejectionReason}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {shop.status !== 'Approved' && (
                              <button
                                onClick={() => approveShop(shop.id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                              >
                                <Check size={12} /> Approve
                              </button>
                            )}
                            {shop.status !== 'Rejected' && shop.status !== 'Suspended' && (
                              <button
                                onClick={() => {
                                  setRejectingShop(shop);
                                  setRejectionReasonInput('');
                                }}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <X size={12} /> Reject
                              </button>
                            )}
                            {shop.status === 'Approved' && (
                              <button
                                onClick={() => suspendShop(shop.id)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                              >
                                Suspend
                              </button>
                            )}
                            {shop.status === 'Suspended' && (
                              <button
                                onClick={() => reactivateShop(shop.id)}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                              >
                                Reactivate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: SELLER MANAGEMENT */}
        {activeTab === 'sellers' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">Merchant Directory &amp; Accounts</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Full list of registered sellers, associated storefronts, and verified status.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Merchant Name</th>
                      <th className="py-3.5 px-4">Associated Shop</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">City</th>
                      <th className="py-3.5 px-4">Verification</th>
                      <th className="py-3.5 px-4 text-right">Direct WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {shops.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{s.ownerName}</td>
                        <td className="py-3.5 px-4 font-semibold text-blue-600">{s.name}</td>
                        <td className="py-3.5 px-4">
                          <p className="font-mono text-slate-800">+{s.phone}</p>
                          <p className="text-[10px] text-slate-400">{s.email}</p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{s.city}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              s.isVerified
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <ShieldCheck size={12} /> {s.isVerified ? 'Verified Merchant' : 'Unverified'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <a
                            href={createWhatsAppLink(s.phone, `Hello ${s.ownerName}! This is Mega Bazar Platform Owner.`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#25D366] text-white rounded-lg text-xs font-bold shadow-2xs hover:bg-[#20ba5a]"
                          >
                            <MessageCircle size={13} /> Chat
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: PRODUCT MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">Product Catalogue Management</h2>
                <p className="text-xs text-slate-500 mt-0.5">Review, approve, edit, hide, or delete products.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by title, SKU, brand..."
                    className="pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-hidden focus:border-blue-500 w-56"
                  />
                  <Search size={14} className="text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  onClick={openNewProduct}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Plus size={16} /> Add Product
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Item</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Stock</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80'}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-100 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900 line-clamp-1">{p.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">Brand: {p.brand} · SKU: {p.sku || p.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">{p.category}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(p.price, settings.currency)}</td>
                        <td className="py-3 px-4">
                          <span className={`font-bold ${p.stock <= 5 ? 'text-rose-600' : 'text-slate-800'}`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                              title="Edit product"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: ORDER MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">Order Management &amp; Deliveries</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update dispatch status, courier tracking, and payment verification.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="all">All Orders ({orders.length})</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <button
                  onClick={refreshOrders}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Customer &amp; Address</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Delivery Status</th>
                      <th className="py-3 px-4 text-right">Update Status &amp; WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">{o.orderNumber}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{o.customerName}</p>
                          <p className="text-[11px] text-slate-500">{o.phone}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-xs">
                            {o.shippingAddress?.address}, {o.shippingAddress?.city}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold uppercase text-[11px] text-slate-800">{o.paymentMethod}</span>
                          {o.transactionId && (
                            <p className="text-[10px] font-mono text-emerald-600">Trx: {o.transactionId}</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-black text-slate-900">{formatCurrency(o.grandTotal, settings.currency)}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              o.orderStatus === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : o.orderStatus === 'Shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : o.orderStatus === 'Confirmed'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {o.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={o.orderStatus}
                              onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            <a
                              href={createWhatsAppLink(
                                o.phone,
                                `Hello ${o.customerName}! Your Mega Bazar order *${o.orderNumber}* status has been updated to: *${o.orderStatus}*. Thank you!`
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-[#25D366] hover:bg-emerald-50 rounded-lg"
                              title="Send WhatsApp update to customer"
                            >
                              <MessageCircle size={15} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: CUSTOMER MANAGEMENT */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">Customer Management</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Profiles, order histories, and contact numbers for registered customers.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">City</th>
                      <th className="py-3.5 px-4">Orders Placed</th>
                      <th className="py-3.5 px-4">Total Spent</th>
                      <th className="py-3.5 px-4 text-right">Support Chat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customerList.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                        <td className="py-3.5 px-4">
                          <p className="font-mono text-slate-800">{c.phone}</p>
                          <p className="text-[10px] text-slate-400">{c.email}</p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{c.city}</td>
                        <td className="py-3.5 px-4 font-semibold">{c.orderCount} order(s)</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-600">
                          {formatCurrency(c.totalSpent, settings.currency)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <a
                            href={createWhatsAppLink(c.phone, `Hello ${c.name}! This is Mega Bazar Help Desk.`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-xs"
                          >
                            <MessageCircle size={13} /> WhatsApp
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 7: PAYMENTS & COMMISSION */}
        {activeTab === 'finance' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h2 className="text-xl font-black text-slate-900">Payments &amp; Platform Commission</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure Pakistani payment receivers, commission rates, and seller payout ledger.
              </p>
            </div>

            {/* Commission Summary Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-500">Standard Commission Rate</p>
                <p className="text-2xl font-black text-blue-600 mt-1">5%</p>
                <p className="text-[11px] text-slate-400 mt-1">Applied to multi-vendor orders</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-500">Estimated Platform Earnings</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">
                  {formatCurrency(totalRevenue * 0.05, settings.currency)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">From total sales</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-500">Seller Settlements Due</p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {formatCurrency(totalRevenue * 0.95, settings.currency)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Via COD rider collection</p>
              </div>
            </div>

            {/* Payout Security Notice */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-amber-700" /> Payment Gateway &amp; Dispatches Compliance
              </p>
              <p>
                Direct bank deductions and automated payouts require formal merchant API approval from State Bank regulated payment gateways (Easypaisa Merchant API / JazzCash Gateway). In COD marketplace mode, courier services collect cash upon delivery, and seller settlements are tracked here manually without unauthorized money movement.
              </p>
            </div>

            {/* Owner Receiving Accounts Form */}
            <form onSubmit={handleSaveSettings} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5 text-xs">
              <h3 className="font-black text-base text-slate-900">Owner Receiving Accounts (EasyPaisa &amp; JazzCash)</h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">EasyPaisa Account Title</label>
                  <input
                    type="text"
                    value={easypaisaName}
                    onChange={(e) => setEasypaisaName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">EasyPaisa Account Number</label>
                  <input
                    type="text"
                    value={easypaisaNo}
                    onChange={(e) => setEasypaisaNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">JazzCash Account Title</label>
                  <input
                    type="text"
                    value={jazzcashName}
                    onChange={(e) => setJazzcashName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">JazzCash Till ID / Number</label>
                  <input
                    type="text"
                    value={jazzcashTill}
                    onChange={(e) => setJazzcashTill(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Standard Delivery Fee (PKR)</label>
                  <input
                    type="number"
                    value={standardShipping}
                    onChange={(e) => setStandardShipping(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Free Shipping Threshold (PKR)</label>
                  <input
                    type="number"
                    value={freeShipping}
                    onChange={(e) => setFreeShipping(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-xs cursor-pointer"
              >
                Save Payment Settings
              </button>
            </form>
          </div>
        )}

        {/* SECTION 8: CHAT & COMPLAINTS */}
        {activeTab === 'complaints' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">Disputes &amp; Complaint Resolution Center</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage reported issues, courier delivery delays, and customer dispute resolution.
                </p>
              </div>

              <div className="flex gap-2">
                {(['all', 'Open', 'Investigating', 'Resolved'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setComplaintFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      complaintFilter === st
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700'
                    }`}
                  >
                    {st === 'all' ? 'All Tickets' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy Shield Disclaimer */}
            <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <strong>Privacy Protection:</strong> Private conversations between customers and merchants are strictly confidential and end-to-end protected. Only tickets and disputes officially filed by customers or flagged for policy violations appear in this moderation queue.
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Ticket</th>
                      <th className="py-3 px-4">Customer &amp; Subject</th>
                      <th className="py-3 px-4">Shop / Order</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Moderator Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredComplaints.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">{c.ticketNumber}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{c.subject}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5">{c.description}</p>
                          <p className="text-[10px] text-slate-400 mt-1">By: {c.customerName} ({c.customerPhone})</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800">{c.shopName || 'Marketplace Item'}</p>
                          {c.orderNumber && <p className="text-[10px] text-slate-400">Order: {c.orderNumber}</p>}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              c.status === 'Resolved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.status === 'Investigating'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={c.status}
                              onChange={(e) => updateComplaintStatus(c.id, e.target.value as Complaint['status'])}
                              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              <option value="Open">Open</option>
                              <option value="Investigating">Investigating</option>
                              <option value="Resolved">Resolved</option>
                              <option value="Dismissed">Dismissed</option>
                            </select>
                            <a
                              href={createWhatsAppLink(c.customerPhone, `Hello ${c.customerName}! Regarding complaint ticket ${c.ticketNumber}.`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                              title="Contact customer"
                            >
                              <MessageCircle size={15} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 9: CATEGORIES & BRANDS */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-900">Catalogue Departments &amp; Categories ({categories.length})</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((c) => (
                <div key={c.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
                  <img src={c.image} alt={c.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{c.name}</h3>
                    <p className="text-[11px] text-slate-400">{c.slug}</p>
                    <span className="text-[10px] text-emerald-600 font-bold uppercase">{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 10: MARKETING & PROMOTIONS */}
        {activeTab === 'marketing' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">Marketing, Discount Coupons &amp; Banners</h2>
              <p className="text-xs text-slate-500 mt-0.5">Manage promotional discount codes and homepage marketing.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Coupons Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-black text-base text-slate-900">Active Discount Coupons</h3>
                <div className="space-y-2.5">
                  {coupons.map((cp) => (
                    <div key={cp.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-mono font-black text-blue-600 text-sm">{cp.code}</span>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          {cp.discountType === 'percentage' ? `${cp.value}% Off` : `PKR ${cp.value} Off`} · Min order: PKR {cp.minOrder}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {cp.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Homepage Banners Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-black text-base text-slate-900">Homepage Hero Banners</h3>
                <div className="space-y-2.5">
                  {banners.map((b) => (
                    <div key={b.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 text-xs">
                      <img src={b.imageUrl} alt={b.title} className="w-14 h-10 object-cover rounded-lg border shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{b.title}</p>
                        <p className="text-[11px] text-slate-500 truncate">{b.subtitle}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                        {b.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 11: REPORTS & ANALYTICS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">Marketplace Reports &amp; Analytics</h2>
              <p className="text-xs text-slate-500 mt-0.5">Performance metrics across shops, delivery fulfillment, and categories.</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-500">Total Orders Fulfilled</p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {orders.filter((o) => o.orderStatus === 'Delivered').length}
                </p>
                <p className="text-[11px] text-emerald-600 mt-1">Delivered to customers</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-500">Average Order Value (AOV)</p>
                <p className="text-2xl font-black text-blue-600 mt-1">
                  {formatCurrency(orders.length > 0 ? totalRevenue / orders.length : 0, settings.currency)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Across all orders</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-500">Top Grossing Category</p>
                <p className="text-xl font-black text-slate-900 mt-1 truncate">Fashion &amp; Apparel</p>
                <p className="text-[11px] text-slate-400 mt-1">Highest order volume</p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 12: WEBSITE SETTINGS & SECURITY */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-xl font-black text-slate-900">Platform Settings, Security &amp; Database</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Owner password management, Supabase live connection, and database migration helper.
              </p>
            </div>

            {/* Supabase Connection Status Card */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-600" />
                  <h3 className="font-black text-base text-slate-900">Supabase Database Connection</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                  Live &amp; Connected
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl font-mono text-[11px] text-slate-700">
                Connected Project URL: <strong>{supabaseUrl}</strong>
              </div>

              <div className="space-y-1 text-slate-600">
                <p>✅ <strong>products table:</strong> Active (Contains live products synced with catalog)</p>
                <p>✅ <strong>orders table:</strong> Active (Customer orders sync directly to Supabase)</p>
                <p>⚡ <strong>mb_shops table:</strong> Ready for 1-click execution in Supabase SQL Editor</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-slate-800">1-Click SQL Script for `mb_shops` Table:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(sqlMigrationCode);
                      setSqlCopied(true);
                      setTimeout(() => setSqlCopied(false), 2500);
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy size={12} /> {sqlCopied ? 'Copied to Clipboard!' : 'Copy SQL'}
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 text-slate-200 rounded-xl text-[10px] font-mono overflow-x-auto max-h-36">
                  {sqlMigrationCode}
                </pre>
              </div>
            </div>

            {/* Master Credentials Form */}
            <form onSubmit={handleSaveSettings} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5 text-xs">
              <h3 className="font-black text-base text-slate-900">Owner Contact &amp; Master Admin Password</h3>

              <div className="space-y-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Store / Marketplace Name</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Owner WhatsApp Customer Hotline (Format: 923XXXXXXXXX)
                  </label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="923182204441"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Change Master Admin Password
                  </label>
                  <div className="relative">
                    <input
                      type={showSettingsPassword ? 'text' : 'password'}
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      placeholder="Enter new master password (min 6 characters)"
                      className="w-full px-4 py-2 pr-11 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:bg-white focus:border-blue-500 outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSettingsPassword(!showSettingsPassword)}
                      aria-label={showSettingsPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    >
                      {showSettingsPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Leave empty to keep existing password. Masked by default with working eye icon.</p>
                </div>

                {settingsSaved && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl font-bold flex items-center gap-2">
                    <Check size={16} /> All settings saved successfully!
                  </div>
                )}

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Save Settings &amp; Password
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Reject Shop Modal with Reason */}
      {rejectingShop && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">Reject Shop Application</h3>
              <button onClick={() => setRejectingShop(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Rejecting shop <strong>{rejectingShop.name}</strong> by <strong>{rejectingShop.ownerName}</strong>. Please provide a clear reason so the seller knows how to fix their application.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rejection Reason *</label>
              <textarea
                rows={3}
                required
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g. Incomplete address, phone number unreachable, or invalid shop category."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingShop(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Product Modal */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm">
                {editingProduct.id?.startsWith('prod-') ? 'Add / Edit Product' : 'Product Details'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={editingProduct.category || categories[0]?.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock Units</label>
                  <input
                    type="number"
                    min={0}
                    value={editingProduct.stock || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Selling Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Original Price (PKR)</label>
                  <input
                    type="number"
                    min={1}
                    value={editingProduct.originalPrice || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Brand Name</label>
                <input
                  type="text"
                  value={editingProduct.brand || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                  placeholder="Mega Bazar"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-700 block mb-1">Main Product Photo</label>
                <div className="flex items-center gap-3">
                  {editingProduct.images?.[0] ? (
                    <div className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-white">
                      <img src={editingProduct.images[0]} alt="Product preview" className="w-full h-full object-cover" />
                    </div>
                  ) : null}
                  <div className="flex-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors text-xs">
                      {isAdminImageUploading ? <Loader2 size={13} className="animate-spin text-blue-600" /> : <Upload size={13} />}
                      <span>{isAdminImageUploading ? 'Uploading to Storage...' : 'Upload Image File'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        disabled={isAdminImageUploading}
                        onChange={handleAdminProductImageUpload}
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">Direct upload to Supabase Storage (Max 10MB)</p>
                  </div>
                </div>
                {adminImageError && (
                  <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                    <AlertCircle size={13} /> {adminImageError}
                  </p>
                )}
                <div>
                  <input
                    type="url"
                    value={editingProduct.images?.[0] || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                    placeholder="Or enter direct image URL (https://...)"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
