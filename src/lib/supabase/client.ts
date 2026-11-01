export const INITIAL_SETTINGS = {
  currency: 'PKR',
  taxPercentage: 0,
  standardShippingFee: 250,
  freeShippingThreshold: 5000,
  adminEmail: 'moizziom84@gmail.com',
  adminUsername: 'admin',
  adminPassword: 'MegaBazar@786',
  whatsappNumber: '+92 300 0000000',
  marketplaceEnabled: true,
};

export const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'Electronics', slug: 'electronics' },
  { id: 'cat-2', name: 'Fashion', slug: 'fashion' },
  { id: 'cat-3', name: 'Home & Living', slug: 'home-living' },
  { id: 'cat-4', name: 'Beauty', slug: 'beauty' },
];

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Premium Wireless Earbuds',
    slug: 'premium-wireless-earbuds',
    price: 7999,
    originalPrice: 9999,
    stock: 18,
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80'],
    description: 'Premium wireless earbuds with noise reduction and long battery life.',
    status: 'active',
    rating: 4.8,
    reviewCount: 120,
    isFeatured: true,
    isBestSeller: true,
    isFlashDeal: true,
    tags: ['audio', 'tech'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Modern Kurta Set',
    slug: 'modern-kurta-set',
    price: 4299,
    originalPrice: 5599,
    stock: 12,
    category: 'Fashion',
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'],
    description: 'Comfortable everyday kurta with elegant detailing.',
    status: 'active',
    rating: 4.9,
    reviewCount: 80,
    isFeatured: true,
    isBestSeller: true,
    tags: ['fashion', 'luxury'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_BANNERS = [
  { id: 'banner-1', title: 'Mega deals', subtitle: 'Save more on trending essentials', image: '/home.webp', link: '/products' },
  { id: 'banner-2', title: 'New season', subtitle: 'Shop profile-ready picks', image: '/fashion.webp', link: '/categories' },
];

export const INITIAL_COUPONS = [
  { id: 'c1', code: 'MEGA10', status: 'active', minOrder: 2000, value: 10, discountType: 'percentage', maxDiscount: 1500 },
  { id: 'c2', code: 'SAVE500', status: 'active', minOrder: 5000, value: 500, discountType: 'fixed' },
];

export const INITIAL_REVIEWS = [
  { id: 'r1', productId: 'prod-1', customerName: 'Ayesha', rating: 5, comment: 'Excellent quality and fast delivery.', status: 'approved' },
  { id: 'r2', productId: 'prod-2', customerName: 'Zain', rating: 4, comment: 'Good fit and premium feel.', status: 'approved' },
];

export const INITIAL_ORDERS = [];
