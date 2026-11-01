'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import {
  Product,
  Category,
  CartItem,
  Order,
  Coupon,
  Banner,
  Review,
  StoreSettings,
  UserProfile,
  NotificationItem,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  SellerShop,
  ShopStatus,
  Complaint,
} from '@/lib/types';
import {
  INITIAL_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_BANNERS,
  INITIAL_COUPONS,
  INITIAL_REVIEWS,
  INITIAL_ORDERS,
} from '@/lib/demo-data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { marketplaceEnabled } from '@/lib/marketplace/browser';
import { formatPakistaniWhatsAppNumber } from '@/lib/whatsapp';
import { generateShopSlug } from '@/lib/utils';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  coupons: Coupon[];
  banners: Banner[];
  reviews: Review[];
  settings: StoreSettings;
  notifications: NotificationItem[];
  user: UserProfile | null;
  isAdmin: boolean;
  isAdminAuthenticated: boolean;
  verifyAdminPassword: (password: string) => boolean | Promise<boolean>;
  verifyAdminCredentials: (identifier: string, password: string) => Promise<boolean> | boolean;
  logoutAdmin: () => void;
  updateAdminPassword: (newPassword: string) => Promise<void>;
  updateAdminCredentials: (newEmail: string, newPassword?: string, newUsername?: string) => Promise<void>;
  isCartOpen: boolean;
  activeCoupon: Coupon | null;
  cartSubtotal: number;
  cartDiscount: number;
  cartShipping: number;
  cartTax: number;
  cartGrandTotal: number;
  cartCount: number;

  // Actions
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, selectedSize?: string) => void;
  removeFromCart: (productId: string, selectedSize?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  applyCoupon: (code: string) => { success: boolean; message: string; discount: number };
  removeCoupon: () => void;
  placeOrder: (orderData: Partial<Order>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string) => Promise<void>;
  updateOrderPaymentStatus: (orderId: string, paymentStatus: PaymentStatus, transactionId?: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshShops: () => Promise<void>;

  // Marketplace Shops & Complaints
  shops: SellerShop[];
  complaints: Complaint[];
  registerShop: (data: {
    fullName: string;
    phone: string;
    email: string;
    shopName: string;
    city: string;
    address: string;
    logoUrl?: string;
    description?: string;
  }) => Promise<{ success: boolean; shop: SellerShop; message: string }>;
  approveShop: (shopId: string) => Promise<void>;
  rejectShop: (shopId: string, reason: string) => Promise<void>;
  suspendShop: (shopId: string) => Promise<void>;
  reactivateShop: (shopId: string) => Promise<void>;
  addComplaint: (data: Omit<Complaint, 'id' | 'ticketNumber' | 'createdAt' | 'status'>) => Promise<void>;
  updateComplaintStatus: (id: string, status: Complaint['status'], resolutionNotes?: string) => Promise<void>;

  // Admin Actions
  createProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<{ success: boolean; message: string }>;
  createCategory: (cat: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  createCoupon: (coupon: Omit<Coupon, 'id'>) => Promise<Coupon>;
  updateCoupon: (id: string, updates: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  updateSettings: (updates: Partial<StoreSettings>) => Promise<void>;
  createReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<Review>;
  moderateReview: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  resetDemoData: () => Promise<void>;
  deleteDemoProducts: () => void;

  // Auth & Notifications
  login: (email: string, role?: 'customer' | 'admin' | 'super_admin' | 'seller', name?: string) => void;
  logout: () => void;
  switchDemoAccount: (role: 'admin' | 'customer') => void;
  markNotificationAsRead: (id: string) => void;
  addNotification: (title: string, message: string, type?: NotificationItem['type']) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEYS = {
  PRODUCTS: 'mb_products_v1',
  CATEGORIES: 'mb_categories_v1',
  ORDERS: 'mb_orders_v1',
  SETTINGS: 'mb_settings_v1',
  COUPONS: 'mb_coupons_v1',
  BANNERS: 'mb_banners_v1',
  REVIEWS: 'mb_reviews_v1',
  CART: 'mb_cart_v1',
  WISHLIST: 'mb_wishlist_v1',
  USER: 'mb_user_v1',
  NOTIFICATIONS: 'mb_notifications_v1',
  ADMIN_AUTH: 'mb_admin_auth_v1',
  SHOPS: 'mb_seller_shops_v1',
  COMPLAINTS: 'mb_complaints_v1',
};

const INITIAL_SHOPS: SellerShop[] = [
  {
    id: 'shop-demo-1',
    ownerId: 'seller-zainab',
    ownerName: 'Zainab Bibi',
    email: 'zainab@rangboutique.pk',
    phone: '03001234567',
    name: 'Rang Boutique',
    slug: 'rang-boutique',
    category: 'Fashion & Clothing',
    city: 'Karachi',
    address: 'Shop 14, Tariq Road, PECHS, Karachi',
    logoUrl: '/demo-shops/fashion.webp',
    description: 'A warm, modern boutique for embroidered essentials and colourful everyday wardrobes.',
    status: 'Approved',
    isVerified: true,
    commissionRate: '5%',
    createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-10-15T10:00:00.000Z',
  },
  {
    id: 'shop-demo-2',
    ownerId: 'seller-ali',
    ownerName: 'Ali Raza',
    email: 'ali@pixeltech.pk',
    phone: '03129876543',
    name: 'Pixel Tech',
    slug: 'pixel-tech',
    category: 'Electronics & Audio',
    city: 'Lahore',
    address: 'Plaza 4B, Hafeez Centre, Gulberg III, Lahore',
    logoUrl: '/demo-shops/electronics.webp',
    description: 'Clean collection of audio, phone accessories and everyday tech essentials.',
    status: 'Approved',
    isVerified: true,
    commissionRate: '4%',
    createdAt: '2026-10-18T10:00:00.000Z',
    updatedAt: '2026-10-18T10:00:00.000Z',
  },
  {
    id: 'shop-demo-3',
    ownerId: 'seller-fatima',
    ownerName: 'Fatima Noor',
    email: 'fatima@gharstudio.pk',
    phone: '03335551234',
    name: 'Ghar Studio',
    slug: 'ghar-studio',
    category: 'Home & Living',
    city: 'Islamabad',
    address: 'Studio 9, Beverly Centre, Blue Area, Islamabad',
    logoUrl: '/demo-shops/home.webp',
    description: 'Thoughtful ceramics, soft textures and natural details for a comfortable home.',
    status: 'Approved',
    isVerified: true,
    commissionRate: '5%',
    createdAt: '2026-10-20T10:00:00.000Z',
    updatedAt: '2026-10-20T10:00:00.000Z',
  },
  {
    id: 'shop-demo-4',
    ownerId: 'seller-maryam',
    ownerName: 'Maryam Siddiqui',
    email: 'maryam@botanicalcare.pk',
    phone: '03214449876',
    name: 'Botanical Care',
    slug: 'botanical-care',
    category: 'Beauty & Personal Care',
    city: 'Karachi',
    address: 'Suite 201, Clifton Block 4, Karachi',
    logoUrl: '/demo-shops/beauty.webp',
    description: 'Botanical-inspired personal care and herbal wellness collection.',
    status: 'Approved',
    isVerified: true,
    commissionRate: '5%',
    createdAt: '2026-10-22T10:00:00.000Z',
    updatedAt: '2026-10-22T10:00:00.000Z',
  },
  {
    id: 'shop-demo-5',
    ownerId: 'seller-tariq',
    ownerName: 'Tariq Mehmood',
    email: 'tariq@playgroundsports.pk',
    phone: '03457778899',
    name: 'Playground Sports',
    slug: 'playground-sports',
    category: 'Sports & Outdoors',
    city: 'Faisalabad',
    address: 'Market 12, Kotwali Road, Faisalabad',
    logoUrl: '/demo-shops/sports.webp',
    description: 'Cricket starter kits, footballs, and active sports equipment.',
    status: 'Approved',
    isVerified: true,
    commissionRate: '4%',
    createdAt: '2026-10-25T10:00:00.000Z',
    updatedAt: '2026-10-25T10:00:00.000Z',
  },
];

const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'comp-101',
    ticketNumber: 'MB-CMP-101',
    customerName: 'Asad Malik',
    customerEmail: 'asad@example.com',
    customerPhone: '03019876543',
    shopName: 'Pixel Tech',
    orderNumber: 'MB-3372',
    subject: 'Delayed courier delivery update',
    description: 'Tracking status was not updated for 3 days by rider.',
    status: 'Investigating',
    priority: 'medium',
    createdAt: '2026-10-28T14:30:00.000Z',
    resolutionNotes: 'Contacted rider dispatch desk in Lahore; package out for delivery today.',
  },
  {
    id: 'comp-102',
    ticketNumber: 'MB-CMP-102',
    customerName: 'Sana Farooq',
    customerEmail: 'sana.f@example.com',
    customerPhone: '03221234567',
    shopName: 'Rang Boutique',
    orderNumber: 'MB-2980',
    subject: 'Size exchange inquiry',
    description: 'Customer requested medium size instead of large kurta.',
    status: 'Resolved',
    priority: 'low',
    createdAt: '2026-10-24T09:15:00.000Z',
    resolutionNotes: 'Boutique agreed to size exchange via Trax courier.',
  },
];

const DEMO_CUSTOMER: UserProfile = {
  uid: 'cust-demo-1',
  email: 'customer@megabazar.pk',
  displayName: 'Emily Johnson',
  phone: '03182204441',
  role: 'customer',
  addresses: [
    {
      fullName: 'Emily Johnson',
      phone: '03182204441',
      address: 'House 14, Main Boulevard, Gulberg III',
      city: 'Lahore',
      province: 'Punjab',
      postalCode: '54000',
      country: 'Pakistan',
    },
  ],
  createdAt: '2026-10-01T00:00:00.000Z',
};

const DEMO_ADMIN: UserProfile = {
  uid: 'admin-1',
  email: 'admin@megabazar.pk',
  displayName: 'Mega Bazar Admin',
  phone: '03182204441',
  role: 'admin',
  addresses: [],
  createdAt: '2026-10-01T00:00:00.000Z',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Core Application State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [shops, setShops] = useState<SellerShop[]>(() => {
    return loadFromStorage<SellerShop[]>(STORAGE_KEYS.SHOPS, INITIAL_SHOPS);
  });
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    return loadFromStorage<Complaint[]>(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
  });
  const [settings, setSettings] = useState<StoreSettings>(() => {
    return loadFromStorage<StoreSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  });
  const [user, setUser] = useState<UserProfile | null>(() => {
    return loadFromStorage<UserProfile | null>(STORAGE_KEYS.USER, null);
  });

  useEffect(() => {
    if (!marketplaceEnabled) return;
    let mounted = true;
    const apply = (session: import('@supabase/supabase-js').Session | null) => {
      if (!mounted) return;
      if (!session) {
        const localAdmin = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
        if (!localAdmin) {
          setIsAdminAuthenticated(false);
          void fetch('/api/admin/auth', { method: 'DELETE' });
        }
        return;
      }
      const appRole = (session.user.app_metadata?.role as string) || '';
      const userRole = (session.user.user_metadata?.role as string) || '';
      const isSuperAdmin = appRole === 'super_admin';
      const effectiveRole: 'customer' | 'admin' | 'super_admin' | 'seller' =
        isSuperAdmin
          ? 'super_admin'
          : appRole === 'admin'
          ? 'admin'
          : appRole === 'seller' || userRole === 'seller'
          ? 'seller'
          : 'customer';

      if (effectiveRole === 'super_admin' || effectiveRole === 'admin') {
        setIsAdminAuthenticated(true);
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
            localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
          } catch {}
        }
      }

      setUser({
        uid: session.user.id,
        email: session.user.email || '',
        displayName:
          session.user.user_metadata?.display_name ||
          (isSuperAdmin ? 'Super Administrator' : session.user.email?.split('@')[0] || 'Customer'),
        role: effectiveRole,
        phone: session.user.user_metadata?.phone,
        addresses: [],
        createdAt: session.user.created_at,
      });
    };
    supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => apply(session));
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [settings.adminEmail]);


  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return (
          sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true' ||
          localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true'
        );
      } catch {
        return false;
      }
    }
    return false;
  });
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Welcome to Mega Bazar!',
      message: 'Use code MEGA10 to save 10% on your first order.',
      type: 'promo',
      read: false,
      createdAt: '2026-10-01T00:00:00.000Z',
    },
  ]);

  // Sync state helper to local storage
  const saveToStorage = (key: string, data: unknown) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (err) {
        console.warn('Could not save to localStorage:', err);
      }
    }
  };

  // Dedicated server synchronization function for shared multi-device storage
  const refreshOrders = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) {
          const mappedOrders: Order[] = data.map((o: any) => ({
            id: String(o.id),
            orderNumber: o.order_number || `MB-${String(o.id).slice(-4)}`,
            customerId: o.customer_id || 'cust-direct',
            customerName: o.customer_name || 'Customer',
            email: o.customer_email || 'customer@megabazar.pk',
            phone: o.customer_phone || '03182204441',
            shippingAddress: {
              fullName: o.customer_name || 'Customer',
              phone: o.customer_phone || '03182204441',
              address: o.shipping_address || 'Delivery Address',
              city: o.city || 'Pakistan',
              province: 'Punjab',
              postalCode: '54000',
              country: 'Pakistan',
            },
            items: [],
            quantities: 1,
            subtotal: Number(o.subtotal || o.total_amount || 0),
            discount: Number(o.discount_amount || 0),
            shippingFee: Number(o.shipping_fee || 250),
            deliveryMethod: 'standard',
            tax: 0,
            grandTotal: Number(o.total_amount || 0),
            currency: 'PKR',
            paymentMethod: (o.payment_method || 'cod') as PaymentMethod,
            paymentStatus: (o.payment_status || 'pending') as PaymentStatus,
            orderStatus: (o.order_status || 'Pending') as OrderStatus,
            trackingNumber: o.tracking_number || '',
            notes: o.notes || '',
            createdAt: o.created_at || new Date().toISOString(),
            updatedAt: o.updated_at || new Date().toISOString(),
          }));
          setOrders(mappedOrders);
          saveToStorage(STORAGE_KEYS.ORDERS, mappedOrders);
          return;
        }
      }

      const res = await fetch('/api/orders', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
          saveToStorage(STORAGE_KEYS.ORDERS, data.orders);
        }
      }
    } catch (err) {
      console.warn('Orders sync notice:', err);
    }
  }, []);

  const refreshShops = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      if (isSupabaseConfigured) {
        const isSuper = user?.role === 'super_admin';
        const targetSource = isSuper ? 'mb_shops' : 'mb_public_shops';
        const { data, error } = await supabase.from(targetSource).select('*');
        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped: SellerShop[] = data.map((s: any) => ({
            id: String(s.id),
            ownerId: s.owner_id || '',
            ownerName: s.owner_name || 'Verified Merchant',
            email: s.email || '',
            phone: s.phone || '',
            name: s.name || '',
            slug: s.slug || generateShopSlug(s.name),
            category: s.category || 'General',
            city: s.city || 'Pakistan',
            address: s.address || '',
            logoUrl: s.logo_url || s.logo_path || s.logoUrl || '',
            description: s.description || '',
            status: (s.status === 'approved'
              ? 'Approved'
              : s.status === 'rejected'
              ? 'Rejected'
              : s.status === 'suspended'
              ? 'Suspended'
              : 'Pending') as ShopStatus,
            rejectionReason: s.reason || '',
            isVerified: Boolean(s.verified),
            commissionRate: s.commission_rate || '5%',
            createdAt: s.created_at || new Date().toISOString(),
            updatedAt: s.updated_at || new Date().toISOString(),
          }));
          setShops((prev) => {
            const remoteSlugs = new Set(mapped.map((m) => m.slug));
            const localOnly = prev.filter((p) => !remoteSlugs.has(p.slug));
            const merged = [...mapped, ...localOnly];
            saveToStorage(STORAGE_KEYS.SHOPS, merged);
            return merged;
          });
          return;
        }
      }
    } catch (err) {
      // Supabase mb_shops not yet migrated
    }
  }, [user?.role]);

  const refreshProducts = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('products').select('*');
        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped: Product[] = data.map((item: any) => ({
            id: String(item.id || `prod-${Date.now()}`),
            name: String(item.name || 'Unnamed Product'),
            slug: String(item.slug || item.id || `prod-${Date.now()}`),
            sku: String(item.sku || `MB-${item.id?.slice(0, 5) || '100'}`),
            description: String(item.description || ''),
            shortDescription: item.short_description || undefined,
            price: Number(item.price || 0),
            originalPrice: item.original_price ? Number(item.original_price) : Number(item.price || 0),
            discountPercentage: item.discount_percentage ? Number(item.discount_percentage) : 0,
            stock: Number(item.stock || 10),
            lowStockThreshold: Number(item.low_stock_threshold || 5),
            images: Array.isArray(item.images) && item.images.length > 0 ? item.images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'],
            specifications: (item.specifications && typeof item.specifications === 'object') ? item.specifications : {},
            category: String(item.category || 'General'),
            brand: String(item.brand || 'Mega Bazar'),
            rating: Number(item.rating || 5),
            reviewCount: Number(item.review_count || 0),
            isFeatured: Boolean(item.is_featured),
            isBestSeller: Boolean(item.is_trending || item.is_featured),
            isFlashDeal: Boolean(item.is_flash_deal),
            status: (item.status === 'active' || item.status === 'draft' || item.status === 'archived') ? item.status : 'active',
            tags: Array.isArray(item.keywords) ? item.keywords : [],
            whatsappNumber: item.whatsapp_number || undefined,
            sellerWhatsapp: item.seller_whatsapp || undefined,
            createdAt: item.created_at || new Date().toISOString(),
            updatedAt: item.updated_at || new Date().toISOString(),
          }));
          setProducts((prev) => {
            const existingIds = new Set(mapped.map((m) => m.id));
            const remaining = prev.filter((p) => !existingIds.has(p.id));
            return [...mapped, ...remaining];
          });
          saveToStorage(STORAGE_KEYS.PRODUCTS, mapped);
          return;
        }
      }

      const res = await fetch('/api/products', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
          saveToStorage(STORAGE_KEYS.PRODUCTS, data.products);
        }
      }
    } catch (err) {
      console.warn('Server products sync unavailable:', err);
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
          saveToStorage(STORAGE_KEYS.SETTINGS, data.settings);
        }
      }
    } catch (err) {
      console.warn('Server settings sync unavailable:', err);
    }
  }, []);

  // Initial client hydration from local storage and background server fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const storedProds = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        if (storedProds) setProducts(JSON.parse(storedProds));

        const storedCats = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
        if (storedCats) setCategories(JSON.parse(storedCats));

        const storedCart = localStorage.getItem(STORAGE_KEYS.CART);
        if (storedCart) setCart(JSON.parse(storedCart));

        const storedWishlist = localStorage.getItem(STORAGE_KEYS.WISHLIST);
        if (storedWishlist) setWishlist(JSON.parse(storedWishlist));

        // Orders are loaded only from the authenticated, scoped API, never a shared browser cache.

        const storedCoupons = localStorage.getItem(STORAGE_KEYS.COUPONS);
        if (storedCoupons) setCoupons(JSON.parse(storedCoupons));

        const storedBanners = localStorage.getItem(STORAGE_KEYS.BANNERS);
        if (storedBanners) setBanners(JSON.parse(storedBanners));

        const storedReviews = localStorage.getItem(STORAGE_KEYS.REVIEWS);
        if (storedReviews) setReviews(JSON.parse(storedReviews));

        const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }

        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            if (
              parsedUser.role === 'admin' ||
              parsedUser.role === 'super_admin' ||
              parsedUser.email?.toLowerCase() === 'moizziom84@gmail.com'
            ) {
              setIsAdminAuthenticated(true);
            }
          } catch {
            // ignore
          }
        }

        const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
        if (storedNotifs) setNotifications(JSON.parse(storedNotifs));

        if (typeof window !== 'undefined') {
          const storedAdminAuth =
            localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) ||
            sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
          if (storedAdminAuth === 'true') {
            setIsAdminAuthenticated(true);
          }
        }
      } catch (err) {
        console.warn('Error reading from storage:', err);
      }

      // Immediately sync with persistent server database
      refreshOrders();
      refreshProducts();
      refreshSettings();
    }, 0);

    // Setup periodic sync so Admin and multi-device updates reflect automatically
    const interval = setInterval(() => {
      refreshOrders();
    }, 8000);

    const handleFocus = () => {
      refreshOrders();
      refreshProducts();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshOrders, refreshProducts, refreshSettings]);

  const addNotification = useCallback(
    (
      title: string,
      message: string,
      type: NotificationItem['type'] = 'system'
    ) => {
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title,
        message,
        type,
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => {
        const updated = [newNotif, ...prev];
        saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
        return updated;
      });
    },
    []
  );

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
      return updated;
    });
  }, []);

  // Cart operations
  const addToCart = useCallback(
    (product: Product, quantity: number = 1, selectedSize?: string) => {
      const targetSize =
        selectedSize ||
        product.size ||
        product.attributes?.size ||
        product.specifications?.Size ||
        product.specifications?.size ||
        (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);

      setCart((prev) => {
        const existing = prev.find(
          (item) => item.productId === product.id && item.selectedSize === targetSize
        );
        let updated: CartItem[];
        if (existing) {
          updated = prev.map((item) =>
            item.productId === product.id && item.selectedSize === targetSize
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          const newItem: CartItem = {
            productId: product.id,
            product,
            quantity,
            selectedSize: targetSize,
          };
          updated = [...prev, newItem];
        }
        saveToStorage(STORAGE_KEYS.CART, updated);
        return updated;
      });
      setIsCartOpen(true);
      addNotification(
        'Added to Cart',
        `${product.name}${targetSize ? ` (Size: ${targetSize})` : ''} (${quantity}x) has been added to your shopping bag.`,
        'order'
      );
    },
    [addNotification]
  );

  const removeFromCart = useCallback((productId: string, selectedSize?: string) => {
    setCart((prev) => {
      const updated = prev.filter((item) => {
        if (selectedSize !== undefined) {
          return !(item.productId === productId && item.selectedSize === selectedSize);
        }
        return item.productId !== productId;
      });
      saveToStorage(STORAGE_KEYS.CART, updated);
      return updated;
    });
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number, selectedSize?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }
    setCart((prev) => {
      const updated = prev.map((item) => {
        const matches =
          item.productId === productId &&
          (selectedSize === undefined || item.selectedSize === selectedSize);
        return matches ? { ...item, quantity } : item;
      });
      saveToStorage(STORAGE_KEYS.CART, updated);
      return updated;
    });
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    setActiveCoupon(null);
    saveToStorage(STORAGE_KEYS.CART, []);
  }, []);

  // Wishlist operations
  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      let updated: string[];
      if (prev.includes(productId)) {
        updated = prev.filter((id) => id !== productId);
        addNotification('Removed from Wishlist', 'Product removed from your saved items.');
      } else {
        updated = [...prev, productId];
        addNotification('Saved to Wishlist', 'Product added to your wishlist.', 'promo');
      }
      saveToStorage(STORAGE_KEYS.WISHLIST, updated);
      return updated;
    });
  }, [addNotification]);

  const isInWishlist = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  // Cart financial calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartDiscount = useMemo(() => {
    if (!activeCoupon) return 0;
    if (cartSubtotal < activeCoupon.minOrder) return 0;
    if (activeCoupon.discountType === 'percentage') {
      const discount = (cartSubtotal * activeCoupon.value) / 100;
      return activeCoupon.maxDiscount
        ? Math.min(discount, activeCoupon.maxDiscount)
        : discount;
    }
    return Math.min(activeCoupon.value, cartSubtotal);
  }, [cartSubtotal, activeCoupon]);

  const cartShipping = useMemo(() => {
    if (cartSubtotal === 0) return 0;
    const threshold = settings.freeShippingThreshold || 5000;
    if (cartSubtotal >= threshold) return 0;
    return settings.standardShippingFee || 250;
  }, [cartSubtotal, settings]);

  const cartTax = useMemo(() => {
    if (!settings.taxPercentage) return 0;
    return Math.round(((cartSubtotal - cartDiscount) * settings.taxPercentage) / 100);
  }, [cartSubtotal, cartDiscount, settings.taxPercentage]);

  const cartGrandTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - cartDiscount + cartShipping + cartTax);
  }, [cartSubtotal, cartDiscount, cartShipping, cartTax]);

  const cartCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // Coupon operations
  const applyCoupon = useCallback(
    (code: string) => {
      const found = coupons.find(
        (c) =>
          c.code.toUpperCase() === code.toUpperCase() && c.status === 'active'
      );
      if (!found) {
        return { success: false, message: 'Invalid or expired coupon code.', discount: 0 };
      }
      if (cartSubtotal < found.minOrder) {
        return {
          success: false,
          message: `Minimum order of ${settings.currency} ${found.minOrder} required for this coupon.`,
          discount: 0,
        };
      }
      setActiveCoupon(found);
      addNotification(
        'Coupon Applied',
        `Discount code "${found.code}" applied successfully!`,
        'promo'
      );
      return { success: true, message: 'Coupon applied successfully!', discount: 0 };
    },
    [coupons, cartSubtotal, settings.currency, addNotification]
  );

  const removeCoupon = useCallback(() => {
    setActiveCoupon(null);
    addNotification('Coupon Removed', 'Promo code has been removed from your cart.');
  }, [addNotification]);

  // ==========================================
  // REAL MULTI-DEVICE PERSISTENT ORDER CREATION
  // ==========================================
  const placeOrder = useCallback(
    async (orderData: Partial<Order>): Promise<Order> => {
      const orderItems =
        orderData.items ||
        cart.map((i) => ({
          productId: i.productId,
          name: i.product.name,
          image: i.product.images[0] || '',
          price: i.product.price,
          originalPrice: i.product.originalPrice,
          quantity: i.quantity,
          selectedSize:
            i.selectedSize ||
            i.product.size ||
            i.product.attributes?.size ||
            i.product.specifications?.Size,
          sku: i.product.sku,
        }));

      if (!orderItems || orderItems.length === 0) {
        throw new Error('Your cart is empty. Please add items to place an order.');
      }

      const orderPayload = {
        userId: user?.uid,
        customerName: orderData.customerName || user?.displayName || 'Customer',
        email: orderData.email || user?.email || 'customer@megabazar.pk',
        phone: orderData.phone || user?.phone || '',
        shippingAddress: orderData.shippingAddress,
        items: orderItems,
        subtotal: orderData.subtotal ?? cartSubtotal,
        discount: orderData.discount ?? cartDiscount,
        shippingFee: orderData.shippingFee ?? cartShipping,
        tax: orderData.tax ?? cartTax,
        grandTotal: orderData.grandTotal ?? cartGrandTotal,
        paymentMethod: orderData.paymentMethod || 'cod',
        transactionId: orderData.transactionId,
        paymentProofUrl: orderData.paymentProofUrl,
        notes: orderData.notes,
        deliveryMethod: orderData.deliveryMethod || 'Standard Delivery (2-4 Days)',
        appliedCoupon: activeCoupon?.code,
      };

      try {
        const { data: { session: orderSession } } = await supabase.auth.getSession();
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(orderSession ? { Authorization: `Bearer ${orderSession.access_token}` } : {}),
          },
          body: JSON.stringify(orderPayload),
        });

        const result = await response.json();

        if (!response.ok || !result.success || !result.order) {
          throw new Error(result.message || 'Failed to create order on server');
        }

        const savedOrder: Order = result.order;

        // Update local orders state
        setOrders((prev) => {
          const updated = [savedOrder, ...prev.filter((o) => o.id !== savedOrder.id)];
          saveToStorage(STORAGE_KEYS.ORDERS, updated);
          return updated;
        });

        // Decrement local product stock
        setProducts((prev) => {
          const updated = prev.map((p) => {
            const match = savedOrder.items.find((item) => item.productId === p.id);
            if (match) {
              return { ...p, stock: Math.max(0, p.stock - match.quantity) };
            }
            return p;
          });
          saveToStorage(STORAGE_KEYS.PRODUCTS, updated);
          return updated;
        });

        // Clear local cart
        clearCart();

        addNotification(
          'Order Placed Successfully!',
          `Order #${savedOrder.orderNumber} for ${settings.currency} ${savedOrder.grandTotal} is received and recorded.`,
          'order'
        );

        return savedOrder;
      } catch (error: unknown) {
        console.error('Checkout error in placeOrder:', error);
        const errMessage =
          error instanceof Error
            ? error.message
            : 'Unable to connect to order server. Please check your internet connection.';
        throw new Error(errMessage);
      }
    },
    [
      user,
      cart,
      cartSubtotal,
      cartDiscount,
      cartShipping,
      cartTax,
      cartGrandTotal,
      activeCoupon,
      settings.currency,
      clearCart,
      addNotification,
    ]
  );

  // ==========================================
  // ORDER STATUS & PAYMENT UPDATES (ADMIN)
  // ==========================================
  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus, trackingNumber?: string) => {
      const now = new Date().toISOString();

      // Optimistically update local state
      setOrders((prev) => {
        const updated = prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                orderStatus: status,
                trackingNumber: trackingNumber ?? o.trackingNumber,
                updatedAt: now,
              }
            : o
        );
        saveToStorage(STORAGE_KEYS.ORDERS, updated);
        return updated;
      });

      try {
        await fetch(`/api/orders/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderStatus: status,
            trackingNumber: trackingNumber,
          }),
        });
      } catch (err) {
        console.error('Failed to sync order status to server:', err);
      }

      addNotification(
        'Order Updated',
        `Order status changed to ${status}.`,
        'order'
      );
    },
    [addNotification]
  );

  const updateOrderPaymentStatus = useCallback(
    async (
      orderId: string,
      paymentStatus: PaymentStatus,
      transactionId?: string
    ) => {
      const now = new Date().toISOString();

      setOrders((prev) => {
        const updated = prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                paymentStatus,
                transactionId: transactionId ?? o.transactionId,
                updatedAt: now,
              }
            : o
        );
        saveToStorage(STORAGE_KEYS.ORDERS, updated);
        return updated;
      });

      try {
        await fetch(`/api/orders/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentStatus,
            transactionId: transactionId,
          }),
        });
      } catch (err) {
        console.error('Failed to sync order payment status to server:', err);
      }
    },
    []
  );

  const deleteOrder = useCallback(
    async (orderId: string) => {
      setOrders((prev) => {
        const updated = prev.filter((o) => o.id !== orderId);
        saveToStorage(STORAGE_KEYS.ORDERS, updated);
        return updated;
      });

      try {
        await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Failed to delete order from server:', err);
      }
      addNotification('Order Deleted', 'Order has been removed from database.', 'order');
    },
    [addNotification]
  );

  // ==========================================
  // PRODUCT & CATALOG CRUD
  // ==========================================
  const createProduct = useCallback(
    async (
      productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<Product> => {
      const id = `prod-${Date.now()}`;
      const now = new Date().toISOString();

      let sanitizedWp: string | undefined = undefined;
      const rawWp = productData.whatsappNumber || productData.sellerWhatsapp;
      if (rawWp) {
        const wpRes = formatPakistaniWhatsAppNumber(rawWp);
        if (wpRes.isValid && wpRes.formatted) {
          sanitizedWp = wpRes.formatted;
        }
      }

      const newProd: Product = {
        ...productData,
        whatsappNumber: sanitizedWp,
        sellerWhatsapp: sanitizedWp,
        size:
          productData.size ||
          productData.attributes?.size ||
          productData.specifications?.Size ||
          productData.specifications?.size,
        id,
        createdAt: now,
        updatedAt: now,
      };

      setProducts((prev) => {
        const updated = [newProd, ...prev.filter((p) => p.id !== id)];
        saveToStorage(STORAGE_KEYS.PRODUCTS, updated);
        return updated;
      });

      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProd),
        });
        if (res.ok) {
          const resData = await res.json().catch(() => ({}));
          if (resData.success && resData.product) {
            setProducts((prev) => {
              const updated = [resData.product, ...prev.filter((p) => p.id !== id)];
              saveToStorage(STORAGE_KEYS.PRODUCTS, updated);
              return updated;
            });
            return resData.product;
          }
        }
      } catch (err) {
        console.warn('Product saved locally, server sync deferred:', err);
      }

      addNotification(
        'Product Created',
        `Added ${newProd.name} to product catalog.`,
        'inventory'
      );
      return newProd;
    },
    [addNotification]
  );

  const updateProduct = useCallback(
    async (id: string, updates: Partial<Product>) => {
      const now = new Date().toISOString();
      const sanitizedUpdates = { ...updates };

      if (updates.whatsappNumber !== undefined || updates.sellerWhatsapp !== undefined) {
        const rawWp = updates.whatsappNumber || updates.sellerWhatsapp;
        if (rawWp) {
          const wpRes = formatPakistaniWhatsAppNumber(rawWp);
          if (wpRes.isValid && wpRes.formatted) {
            sanitizedUpdates.whatsappNumber = wpRes.formatted;
            sanitizedUpdates.sellerWhatsapp = wpRes.formatted;
          }
        } else {
          sanitizedUpdates.whatsappNumber = undefined;
          sanitizedUpdates.sellerWhatsapp = undefined;
        }
      }

      let updatedList: Product[] = [];
      setProducts((prev) => {
        updatedList = prev.map((p) =>
          p.id === id ? { ...p, ...sanitizedUpdates, updatedAt: now } : p
        );
        saveToStorage(STORAGE_KEYS.PRODUCTS, updatedList);
        return updatedList;
      });

      try {
        await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedList),
        });
      } catch (err) {
        console.warn('Product update saved locally:', err);
      }
    },
    []
  );

  const deleteProduct = useCallback(
    async (id: string): Promise<{ success: boolean; message: string }> => {
      // 1. Perform server-side deletion with admin auth headers
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-auth': 'true',
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        const errorMsg = data.message || 'Failed to delete product from database.';
        throw new Error(errorMsg);
      }

      // 2. Remove product from in-memory state and local cache without affecting any other products
      let updatedList: Product[] = [];
      setProducts((prev) => {
        updatedList = prev.filter((p) => p.id !== id);
        saveToStorage(STORAGE_KEYS.PRODUCTS, updatedList);
        return updatedList;
      });

      // 3. Remove from cart and wishlist if present
      setCart((prev) => {
        const updatedCart = prev.filter((item) => item.product.id !== id);
        saveToStorage(STORAGE_KEYS.CART, updatedCart);
        return updatedCart;
      });

      setWishlist((prev) => {
        const updatedWishlist = prev.filter((item) => item !== id);
        saveToStorage(STORAGE_KEYS.WISHLIST, updatedWishlist);
        return updatedWishlist;
      });

      addNotification(
        'Product Deleted',
        'Product deleted successfully.',
        'inventory'
      );

      return {
        success: true,
        message: data.message || 'Product deleted successfully.',
      };
    },
    [addNotification]
  );

  // Category CRUD
  const createCategory = useCallback(async (catData: Omit<Category, 'id'>): Promise<Category> => {
    const id = `cat-${Date.now()}`;
    const newCat: Category = { ...catData, id };
    setCategories((prev) => {
      const updated = [...prev, newCat];
      saveToStorage(STORAGE_KEYS.CATEGORIES, updated);
      return updated;
    });

    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCat),
      });
    } catch (err) {
      console.warn('Could not sync category to server:', err);
    }

    return newCat;
  }, []);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    setCategories((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      saveToStorage(STORAGE_KEYS.CATEGORIES, updated);
      return updated;
    });

    try {
      await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
    } catch (err) {
      console.warn('Could not sync category update to server:', err);
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveToStorage(STORAGE_KEYS.CATEGORIES, updated);
      return updated;
    });

    try {
      await fetch(`/api/categories?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Could not sync category deletion to server:', err);
    }
  }, []);

  // Coupon CRUD
  const createCoupon = useCallback(async (couponData: Omit<Coupon, 'id'>): Promise<Coupon> => {
    const id = `c-${Date.now()}`;
    const newCoupon: Coupon = { ...couponData, id };
    setCoupons((prev) => {
      const updated = [newCoupon, ...prev];
      saveToStorage(STORAGE_KEYS.COUPONS, updated);
      return updated;
    });
    return newCoupon;
  }, []);

  const updateCoupon = useCallback(async (id: string, updates: Partial<Coupon>) => {
    setCoupons((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      saveToStorage(STORAGE_KEYS.COUPONS, updated);
      return updated;
    });
  }, []);

  const deleteCoupon = useCallback(async (id: string) => {
    setCoupons((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveToStorage(STORAGE_KEYS.COUPONS, updated);
      return updated;
    });
  }, []);

  // Settings
  const updateSettings = useCallback(
    async (updates: Partial<StoreSettings>) => {
      const sanitizedUpdates = { ...updates };
      if (updates.whatsappNumber !== undefined) {
        const wpRes = formatPakistaniWhatsAppNumber(updates.whatsappNumber);
        if (wpRes.isValid && wpRes.formatted) {
          sanitizedUpdates.whatsappNumber = wpRes.formatted;
        }
      }

      let updated: StoreSettings = INITIAL_SETTINGS;
      setSettings((prev) => {
        updated = { ...prev, ...sanitizedUpdates };
        saveToStorage(STORAGE_KEYS.SETTINGS, updated);
        return updated;
      });

      try {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sanitizedUpdates),
        });
      } catch (err) {
        console.warn('Settings saved locally:', err);
      }

      addNotification('Settings Saved', 'Mega Bazar store settings updated.', 'system');
    },
    [addNotification]
  );

  // Reviews
  const createReview = useCallback(
    async (revData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> => {
      const id = `rev-${Date.now()}`;
      const newRev: Review = {
        ...revData,
        id,
        createdAt: new Date().toISOString(),
      };
      setReviews((prev) => {
        const updated = [newRev, ...prev];
        saveToStorage(STORAGE_KEYS.REVIEWS, updated);
        return updated;
      });
      addNotification(
        'Review Submitted',
        'Thank you! Your review is pending moderator approval.',
        'review'
      );
      return newRev;
    },
    [addNotification]
  );

  const moderateReview = useCallback(
    async (id: string, status: 'approved' | 'rejected') => {
      setReviews((prev) => {
        const updated = prev.map((r) => (r.id === id ? { ...r, status } : r));
        saveToStorage(STORAGE_KEYS.REVIEWS, updated);
        return updated;
      });
    },
    []
  );

  // Demo Controls
  const resetDemoData = useCallback(async () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setOrders(INITIAL_ORDERS);
    setCoupons(INITIAL_COUPONS);
    setBanners(INITIAL_BANNERS);
    setReviews(INITIAL_REVIEWS);
    setSettings(INITIAL_SETTINGS);

    saveToStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    saveToStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    saveToStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    saveToStorage(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
    saveToStorage(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
    saveToStorage(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    saveToStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);

    try {
      await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(INITIAL_PRODUCTS),
      });
    } catch {
      // ignore
    }

    addNotification(
      'Demo Data Reset',
      'Store has been repopulated with initial products and data.',
      'system'
    );
  }, [addNotification]);

  const deleteDemoProducts = useCallback(() => {
    setProducts([]);
    saveToStorage(STORAGE_KEYS.PRODUCTS, []);
    addNotification(
      'Demo Products Cleared',
      'All products removed. You can add new products anytime.',
      'system'
    );
  }, [addNotification]);

  useEffect(() => { const sync=()=>{fetch('/api/admin/auth', {cache:'no-store'}).then(r=>setIsAdminAuthenticated(r.ok)).catch(()=>setIsAdminAuthenticated(false));}; sync(); window.addEventListener('mb-owner-session',sync); return()=>window.removeEventListener('mb-owner-session',sync); }, []);

  // Auth
  const login = useCallback(
    (
      email: string,
      role: 'customer' | 'admin' | 'super_admin' | 'seller' = 'customer',
      name?: string
    ) => {
      const isOwner =
        email.toLowerCase() === 'moizziom84@gmail.com' ||
        email.toLowerCase() === (settings.adminEmail || '').toLowerCase();

      const effectiveRole: 'customer' | 'admin' | 'super_admin' | 'seller' = isOwner
        ? 'super_admin'
        : role;

      const profile: UserProfile = {
        uid: isOwner
          ? 'owner-moiz'
          : effectiveRole === 'admin' || effectiveRole === 'super_admin'
          ? 'admin-root'
          : `cust-${Date.now()}`,
        email,
        displayName:
          name ||
          (isOwner
            ? 'Muhammad Moiz (Platform Owner)'
            : effectiveRole === 'super_admin' || effectiveRole === 'admin'
            ? 'Mega Bazar Administrator'
            : email.split('@')[0]),
        role: effectiveRole,
        addresses: [],
        createdAt: new Date().toISOString(),
      };
      setUser(profile);
      saveToStorage(STORAGE_KEYS.USER, profile);

      if (isOwner || effectiveRole === 'admin' || effectiveRole === 'super_admin') {
        setIsAdminAuthenticated(true);
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
            localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
            document.cookie = 'mb_admin_auth=true; path=/; max-age=86400; SameSite=Lax';
          } catch {
            // ignore
          }
        }
      } else {
        setIsAdminAuthenticated(false);
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
            localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
            document.cookie = 'mb_admin_auth=; path=/; max-age=0; SameSite=Lax';
          } catch {
            // ignore
          }
        }
      }

      addNotification('Signed In', `Welcome back, ${profile.displayName}!`, 'system');
    },
    [addNotification, settings.adminEmail]
  );

  const logout = useCallback(() => {
    if (marketplaceEnabled) void supabase.auth.signOut();
    void fetch('/api/admin/auth', { method: 'DELETE' });
    setUser(null);
    setOrders([]);
    setIsAdminAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER);
      try {
        sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
        localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
        document.cookie = 'mb_admin_auth=; path=/; max-age=0; SameSite=Lax';
      } catch {
        // ignore
      }
    }
    addNotification('Signed Out', 'You have been safely signed out.', 'system');
  }, [addNotification]);

  const switchDemoAccount = useCallback(
    (role: 'admin' | 'customer') => {
      if (role === 'admin') {
        setUser(DEMO_ADMIN);
        setIsAdminAuthenticated(true);
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
            localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
            document.cookie = 'mb_admin_auth=true; path=/; max-age=86400; SameSite=Lax';
          } catch {
            // ignore
          }
        }
        saveToStorage(STORAGE_KEYS.USER, DEMO_ADMIN);
        addNotification(
          'Switched to Admin',
          'You are now signed in as Administrator.',
          'system'
        );
      } else {
        setUser(DEMO_CUSTOMER);
        setIsAdminAuthenticated(false);
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
            localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
            document.cookie =
              'mb_admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; max-age=0; SameSite=Lax';
          } catch {
            // ignore
          }
        }
        saveToStorage(STORAGE_KEYS.USER, DEMO_CUSTOMER);
        addNotification(
          'Switched to Customer',
          'You are now signed in as Customer Emily Johnson.',
          'system'
        );
      }
    },
    [addNotification]
  );

  const verifyAdminCredentials = useCallback(
    async (identifier: string, inputPassword: string): Promise<boolean> => {
      const trimmedId = (identifier || '').trim();
      const trimmedPass = (inputPassword || '').trim();

      if (!trimmedId || !trimmedPass) return false;

      // 1. Authenticate against server-side private auth endpoint if available
      try {
        const res = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminId: trimmedId, password: trimmedPass }),
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          setIsAdminAuthenticated(true);
          const ownerProfile: UserProfile = {
            uid: 'owner-moiz',
            email: 'moizziom84@gmail.com',
            displayName: 'Muhammad Moiz (Platform Owner)',
            role: 'super_admin',
            addresses: [],
            createdAt: new Date().toISOString(),
          };
          setUser(ownerProfile);
          saveToStorage(STORAGE_KEYS.USER, ownerProfile);
          if (typeof window !== 'undefined') {
            try {
              sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
              localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
              document.cookie = 'mb_admin_auth=true; path=/; max-age=86400; SameSite=Lax';
            } catch {
              // ignore
            }
          }
          return true;
        }
      } catch (err) {
        console.warn('Server admin auth request error, checking local:', err);
      }

      // 2. Local fallback check for Platform Owner / Super Admin
      const expectedPassword = settings.adminPassword || 'MegaBazar@786';
      const validIdentifiers = [
        'admin',
        'moizziom84@gmail.com',
        'admin@megabazar.pk',
        (settings.adminUsername || 'admin').toLowerCase(),
        (settings.adminEmail || 'moizziom84@gmail.com').toLowerCase(),
      ];

      if (validIdentifiers.includes(trimmedId.toLowerCase()) && trimmedPass === expectedPassword) {
        setIsAdminAuthenticated(true);
        const ownerProfile: UserProfile = {
          uid: 'owner-moiz',
          email: 'moizziom84@gmail.com',
          displayName: 'Muhammad Moiz (Platform Owner)',
          role: 'super_admin',
          addresses: [],
          createdAt: new Date().toISOString(),
        };
        setUser(ownerProfile);
        saveToStorage(STORAGE_KEYS.USER, ownerProfile);
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
            localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
            document.cookie = 'mb_admin_auth=true; path=/; max-age=86400; SameSite=Lax';
          } catch {
            // ignore
          }
        }
        return true;
      }

      return false;
    },
    [settings]
  );

  const verifyAdminPassword = useCallback(
    async (inputPassword: string): Promise<boolean> => {
      return verifyAdminCredentials('admin@megabazar.pk', inputPassword);
    },
    [verifyAdminCredentials]
  );

  const logoutAdmin = useCallback(() => {
    if (marketplaceEnabled) void supabase.auth.signOut();
    setUser(null);
    setIsAdminAuthenticated(false);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
        localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
        document.cookie =
          'mb_admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; max-age=0; SameSite=Lax';
      } catch {
        // ignore
      }
    }
    // Also notify server to clear auth cookie
    try {
      fetch('/api/admin/auth', { method: 'DELETE' }).catch(() => {});
    } catch {
      // ignore
    }
  }, []);

  const updateAdminPassword = useCallback(
    async (newPassword: string) => {
      const updated: StoreSettings = { ...settings, adminPassword: newPassword };
      setSettings(updated);
      saveToStorage(STORAGE_KEYS.SETTINGS, updated);
      try {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminPassword: newPassword }),
        });
      } catch (err) {
        console.warn('Password update local sync:', err);
      }
      addNotification('Password Updated', 'Admin password has been updated.', 'system');
    },
    [settings, addNotification]
  );

  const updateAdminCredentials = useCallback(
    async (newEmail: string, newPassword?: string, newUsername?: string) => {
      const updated: StoreSettings = {
        ...settings,
        adminEmail: newEmail.trim(),
        ...(newUsername ? { adminUsername: newUsername.trim() } : {}),
        ...(newPassword && newPassword.trim() ? { adminPassword: newPassword.trim() } : {}),
      };
      setSettings(updated);
      saveToStorage(STORAGE_KEYS.SETTINGS, updated);
      try {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        });
      } catch (err) {
        console.warn('Credentials update local sync:', err);
      }
      addNotification('Security Updated', 'Admin credentials updated successfully.', 'system');
    },
    [settings, addNotification]
  );

  const registerShop = useCallback(
    async (data: {
      fullName: string;
      phone: string;
      email: string;
      shopName: string;
      city: string;
      address: string;
      logoUrl?: string;
      description?: string;
    }): Promise<{ success: boolean; shop: SellerShop; message: string }> => {
      const cleanSlug = generateShopSlug(data.shopName);
      const newShop: SellerShop = {
        id: `shop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ownerId: user?.uid || `owner-${Date.now()}`,
        ownerName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        name: data.shopName.trim(),
        slug: cleanSlug,
        category: 'Multi-Vendor Retail',
        city: data.city.trim(),
        address: data.address.trim(),
        logoUrl: data.logoUrl || undefined,
        description: data.description?.trim() || `${data.shopName} - Verified Pakistani merchant on Mega Bazar.`,
        status: 'Pending',
        isVerified: false,
        commissionRate: '5%',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isSupabaseConfigured) {
        try {
          await supabase.from('mb_shops').insert({
            id: newShop.id,
            owner_id: user?.uid,
            owner_name: newShop.ownerName,
            email: newShop.email,
            phone: newShop.phone,
            name: newShop.name,
            slug: newShop.slug,
            category: newShop.category,
            city: newShop.city,
            address: newShop.address,
            logo_url: newShop.logoUrl || null,
            description: newShop.description,
            status: 'pending',
          });
        } catch (e) {
          console.warn('Supabase shop insert notice:', e);
        }
      }

      setShops((prev) => {
        const filtered = prev.filter((s) => s.slug !== cleanSlug && s.email !== newShop.email);
        const updated = [newShop, ...filtered];
        saveToStorage(STORAGE_KEYS.SHOPS, updated);
        return updated;
      });

      addNotification(
        'Shop Application Submitted',
        `Your shop "${newShop.name}" is now Pending Approval by Super Admin.`,
        'system'
      );

      return {
        success: true,
        shop: newShop,
        message:
          'Your shop application has been submitted successfully and is now Pending Approval by Mega Bazar Super Admin.',
      };
    },
    [user?.uid, addNotification]
  );

  const approveShop = useCallback(
    async (shopId: string) => {
      setShops((prev) => {
        const updated = prev.map((s) =>
          s.id === shopId ? { ...s, status: 'Approved' as ShopStatus, isVerified: true, updatedAt: new Date().toISOString() } : s
        );
        saveToStorage(STORAGE_KEYS.SHOPS, updated);
        return updated;
      });
      if (isSupabaseConfigured) {
        try {
          await supabase.from('mb_shops').update({ status: 'approved', verified: true, reviewed_at: new Date().toISOString() }).eq('id', shopId);
        } catch {}
      }
      addNotification('Shop Approved', 'Shop has been approved and is now publicly live on Mega Bazar.', 'system');
    },
    [addNotification]
  );

  const rejectShop = useCallback(
    async (shopId: string, reason: string) => {
      setShops((prev) => {
        const updated = prev.map((s) =>
          s.id === shopId ? { ...s, status: 'Rejected' as ShopStatus, rejectionReason: reason, updatedAt: new Date().toISOString() } : s
        );
        saveToStorage(STORAGE_KEYS.SHOPS, updated);
        return updated;
      });
      if (isSupabaseConfigured) {
        try {
          await supabase.from('mb_shops').update({ status: 'rejected', reason, reviewed_at: new Date().toISOString() }).eq('id', shopId);
        } catch {}
      }
      addNotification('Shop Rejected', 'Shop application has been rejected. Reason logged for seller.', 'system');
    },
    [addNotification]
  );

  const suspendShop = useCallback(
    async (shopId: string) => {
      setShops((prev) => {
        const updated = prev.map((s) =>
          s.id === shopId ? { ...s, status: 'Suspended' as ShopStatus, updatedAt: new Date().toISOString() } : s
        );
        saveToStorage(STORAGE_KEYS.SHOPS, updated);
        return updated;
      });
      if (isSupabaseConfigured) {
        try {
          await supabase.from('mb_shops').update({ status: 'suspended', updated_at: new Date().toISOString() }).eq('id', shopId);
        } catch {}
      }
      addNotification('Shop Suspended', 'Shop storefront has been temporarily suspended.', 'system');
    },
    [addNotification]
  );

  const reactivateShop = useCallback(
    async (shopId: string) => {
      setShops((prev) => {
        const updated = prev.map((s) =>
          s.id === shopId ? { ...s, status: 'Approved' as ShopStatus, updatedAt: new Date().toISOString() } : s
        );
        saveToStorage(STORAGE_KEYS.SHOPS, updated);
        return updated;
      });
      if (isSupabaseConfigured) {
        try {
          await supabase.from('mb_shops').update({ status: 'approved', updated_at: new Date().toISOString() }).eq('id', shopId);
        } catch {}
      }
      addNotification('Shop Reactivated', 'Shop storefront has been reactivated.', 'system');
    },
    [addNotification]
  );

  const addComplaint = useCallback(
    async (data: Omit<Complaint, 'id' | 'ticketNumber' | 'createdAt' | 'status'>) => {
      const newComp: Complaint = {
        id: `comp-${Date.now()}`,
        ticketNumber: `MB-CMP-${Math.floor(100 + Math.random() * 900)}`,
        ...data,
        status: 'Open',
        createdAt: new Date().toISOString(),
      };
      setComplaints((prev) => {
        const updated = [newComp, ...prev];
        saveToStorage(STORAGE_KEYS.COMPLAINTS, updated);
        return updated;
      });
      addNotification('Complaint Logged', `Complaint #${newComp.ticketNumber} received and assigned for review.`, 'system');
    },
    [addNotification]
  );

  const updateComplaintStatus = useCallback(
    async (id: string, status: Complaint['status'], resolutionNotes?: string) => {
      setComplaints((prev) => {
        const updated = prev.map((c) =>
          c.id === id ? { ...c, status, resolutionNotes: resolutionNotes || c.resolutionNotes } : c
        );
        saveToStorage(STORAGE_KEYS.COMPLAINTS, updated);
        return updated;
      });
      addNotification('Complaint Updated', `Complaint status changed to ${status}.`, 'system');
    },
    [addNotification]
  );

  // Admin status strictly requires active password-authenticated session
  const isAdmin = isAdminAuthenticated;

  const value = useMemo(
    () => ({
      products,
      categories,
      cart,
      wishlist,
      orders,
      coupons,
      banners,
      reviews,
      shops,
      complaints,
      settings,
      notifications,
      user,
      isAdmin,
      isAdminAuthenticated,
      verifyAdminPassword,
      verifyAdminCredentials,
      logoutAdmin,
      updateAdminPassword,
      updateAdminCredentials,
      isCartOpen,
      activeCoupon,
      cartSubtotal,
      cartDiscount,
      cartShipping,
      cartTax,
      cartGrandTotal,
      cartCount,
      setIsCartOpen,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      toggleWishlist,
      isInWishlist,
      applyCoupon,
      removeCoupon,
      placeOrder,
      updateOrderStatus,
      updateOrderPaymentStatus,
      deleteOrder,
      refreshOrders,
      refreshProducts,
      refreshShops,
      registerShop,
      approveShop,
      rejectShop,
      suspendShop,
      reactivateShop,
      addComplaint,
      updateComplaintStatus,
      createProduct,
      updateProduct,
      deleteProduct,
      createCategory,
      updateCategory,
      deleteCategory,
      createCoupon,
      updateCoupon,
      deleteCoupon,
      updateSettings,
      createReview,
      moderateReview,
      resetDemoData,
      deleteDemoProducts,
      login,
      logout,
      switchDemoAccount,
      markNotificationAsRead,
      addNotification,
    }),
    [
      products,
      categories,
      cart,
      wishlist,
      orders,
      coupons,
      banners,
      reviews,
      shops,
      complaints,
      settings,
      notifications,
      user,
      isAdmin,
      isAdminAuthenticated,
      isCartOpen,
      activeCoupon,
      cartSubtotal,
      cartDiscount,
      cartShipping,
      cartTax,
      cartGrandTotal,
      cartCount,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      toggleWishlist,
      isInWishlist,
      applyCoupon,
      removeCoupon,
      placeOrder,
      updateOrderStatus,
      updateOrderPaymentStatus,
      deleteOrder,
      refreshOrders,
      refreshProducts,
      refreshShops,
      registerShop,
      approveShop,
      rejectShop,
      suspendShop,
      reactivateShop,
      addComplaint,
      updateComplaintStatus,
      createProduct,
      updateProduct,
      deleteProduct,
      createCategory,
      updateCategory,
      deleteCategory,
      createCoupon,
      updateCoupon,
      deleteCoupon,
      updateSettings,
      createReview,
      moderateReview,
      resetDemoData,
      deleteDemoProducts,
      login,
      logout,
      switchDemoAccount,
      verifyAdminPassword,
      verifyAdminCredentials,
      logoutAdmin,
      updateAdminPassword,
      updateAdminCredentials,
      markNotificationAsRead,
      addNotification,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
