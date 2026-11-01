export type Product = {
  id: string;
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number;
  stock?: number;
  category?: string;
  images?: string[];
  description?: string;
  status?: string;
  rating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isFlashDeal?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type Category = {
  id: string;
  name: string;
  description?: string;
  slug?: string;
};

export type CartItem = {
  productId: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName?: string;
  email?: string;
  phone?: string;
  shippingAddress?: any;
  items: any[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  grandTotal: number;
  currency?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;
  trackingNumber?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Coupon = {
  id: string;
  code: string;
  status: string;
  minOrder: number;
  value: number;
  discountType: 'percentage' | 'fixed';
  maxDiscount?: number;
};

export type Banner = {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  link?: string;
};

export type Review = {
  id: string;
  productId?: string;
  customerName: string;
  rating: number;
  comment: string;
  status?: 'approved' | 'rejected';
  createdAt?: string;
};

export type StoreSettings = {
  currency: string;
  taxPercentage?: number;
  standardShippingFee?: number;
  freeShippingThreshold?: number;
  adminEmail?: string;
  adminUsername?: string;
  adminPassword?: string;
  whatsappNumber?: string;
  marketplaceEnabled?: boolean;
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  role: 'customer' | 'admin' | 'super_admin' | 'seller';
  addresses: any[];
  createdAt?: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: 'promo' | 'order' | 'system' | 'inventory' | 'review';
  read?: boolean;
  createdAt?: string;
};

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cod' | 'card' | 'bank' | 'easypaisa' | 'jazzcash';
export type SellerShop = {
  id: string;
  ownerId?: string;
  ownerName?: string;
  email?: string;
  phone?: string;
  name: string;
  slug: string;
  category?: string;
  city?: string;
  address?: string;
  logoUrl?: string;
  description?: string;
  status?: 'Approved' | 'Pending' | 'Rejected' | 'Suspended';
  isVerified?: boolean;
  commissionRate?: string;
  createdAt?: string;
  updatedAt?: string;
  rejectionReason?: string;
};
export type ShopStatus = SellerShop['status'];
export type Complaint = {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  shopName?: string;
  orderNumber?: string;
  subject: string;
  description: string;
  status: 'Open' | 'Investigating' | 'Resolved';
  priority?: 'low' | 'medium' | 'high';
  createdAt?: string;
  resolutionNotes?: string;
};
