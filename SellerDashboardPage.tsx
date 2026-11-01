'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, createWhatsAppLink } from '@/lib/utils';
import { Product } from '@/lib/types';
import {
  Store,
  Package,
  ShoppingBag,
  Plus,
  ArrowRight,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Edit2,
  Trash2,
  Phone,
  MessageCircle,
  Eye,
  TrendingUp,
  Upload,
  Loader2,
} from 'lucide-react';
import { uploadImageToSupabase } from '@/lib/supabase/storage';

export const SellerDashboardPage: React.FC = () => {
  const { user, shops, products, orders, categories, settings, createProduct, updateProduct, deleteProduct } = useStore();

  // Find the current logged-in seller's shop
  const currentShop = shops.find(
    (s) =>
      (user?.email && s.email.toLowerCase() === user.email.toLowerCase()) ||
      (user?.uid && s.ownerId === user.uid)
  );

  // Modal for adding a new product by this seller
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<Partial<Product> | null>(null);

  // New product form fields
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState(categories[0]?.name || 'Fashion');
  const [prodPrice, setProdPrice] = useState<number>(1500);
  const [prodOriginalPrice, setProdOriginalPrice] = useState<number>(2000);
  const [prodStock, setProdStock] = useState<number>(10);
  const [prodDescription, setProdDescription] = useState('High quality genuine item with fast nationwide dispatch across Pakistan.');
  const [prodImageUrl, setProdImageUrl] = useState('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleUploadProductImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    setUploadError('');
    try {
      const res = await uploadImageToSupabase(file, {
        bucket: 'mb-product-images',
        folder: 'seller-products',
        maxSizeMB: 10,
      });
      if (res.success && res.url) {
        setProdImageUrl(res.url);
        if (res.isFallback && res.error) {
          setUploadError(res.error);
        }
      } else {
        setUploadError(res.error || 'Failed to upload photo.');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Image upload error.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Products belonging strictly to this seller (by brand name or seller whatsapp)
  const sellerProducts = products.filter((p) => {
    if (!currentShop) return false;
    return (
      (p.brand && p.brand.toLowerCase() === currentShop.name.toLowerCase()) ||
      (p.sellerWhatsapp && p.sellerWhatsapp === currentShop.phone) ||
      (p.whatsappNumber && p.whatsappNumber === currentShop.phone)
    );
  });

  // Orders for this seller
  const sellerOrders = orders.filter((o) => {
    if (!currentShop) return false;
    return (
      o.items.some((item) =>
        sellerProducts.some((p) => p.id === item.productId || p.name === item.name)
      ) || o.phone === currentShop.phone
    );
  });

  const handleOpenAddModal = () => {
    setProdName('');
    setProdCategory(categories[0]?.name || 'Fashion');
    setProdPrice(1500);
    setProdOriginalPrice(2000);
    setProdStock(10);
    setProdDescription('High quality genuine item with fast nationwide dispatch across Pakistan.');
    setProdImageUrl('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80');
    setEditingProd(null);
    setIsAddProductOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    const discount =
      prodOriginalPrice > prodPrice
        ? Math.round(((prodOriginalPrice - prodPrice) / prodOriginalPrice) * 100)
        : 0;

    const productPayload: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
      name: prodName.trim(),
      slug: prodName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku: `SKU-${Date.now().toString().slice(-5)}`,
      brand: currentShop?.name || 'Mega Bazar Merchant',
      category: prodCategory,
      price: Number(prodPrice),
      originalPrice: Number(prodOriginalPrice),
      discountPercentage: discount,
      stock: Number(prodStock),
      lowStockThreshold: 3,
      description: prodDescription.trim(),
      images: [prodImageUrl.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'],
      specifications: {},
      tags: [currentShop?.name || 'Seller Product', 'New'],
      isFeatured: false,
      isBestSeller: false,
      isFlashDeal: false,
      rating: 5,
      reviewCount: 0,
      status: currentShop?.status === 'Approved' ? 'active' : 'draft',
      whatsappNumber: currentShop?.phone || '923182204441',
      sellerWhatsapp: currentShop?.phone || '923182204441',
    };

    if (editingProd?.id) {
      await updateProduct(editingProd.id, productPayload);
    } else {
      await createProduct(productPayload);
    }

    setIsAddProductOpen(false);
  };

  // State 1: User not logged in
  if (!user) {
    return (
      <div className="py-16 sm:py-24 bg-slate-50 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-7 sm:p-9 shadow-lg border border-slate-200 text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Store size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Seller Workspace Sign In</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Please log in with your registered seller email to access your shop dashboard, product catalog, and customer orders.
          </p>
          <div className="space-y-2.5 pt-2">
            <Link
              href="/login"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors block"
            >
              Log In to Seller Account →
            </Link>
            <Link
              href="/open-shop"
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors block"
            >
              Register New Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State 2: User logged in but no shop registered yet
  if (!currentShop) {
    return (
      <div className="py-16 sm:py-24 bg-slate-50 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-7 sm:p-9 shadow-lg border border-slate-200 text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Store size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900">No Shop Registered Yet</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Signed in as <strong>{user.email}</strong>. You have not registered a shop on Mega Bazar yet. Open your shop in 2 minutes!
          </p>
          <Link
            href="/open-shop"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors block"
          >
            Register My Shop Now →
          </Link>
        </div>
      </div>
    );
  }

  const isPending = currentShop.status === 'Pending';
  const isRejected = currentShop.status === 'Rejected';
  const isApproved = currentShop.status === 'Approved';

  return (
    <div className="py-8 sm:py-12 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header Title & Status */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                SELLER DASHBOARD
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  isApproved
                    ? 'bg-emerald-100 text-emerald-800'
                    : isPending
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-rose-100 text-rose-900'
                }`}
              >
                {currentShop.status === 'Approved' ? 'Approved & Live' : `${currentShop.status} Approval`}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{currentShop.name}</h1>
            <p className="text-xs text-slate-500">
              Merchant: {currentShop.ownerName} · Location: {currentShop.city} · WhatsApp: +{currentShop.phone}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {isApproved && (
              <Link
                href={`/shop/${currentShop.slug}`}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <ExternalLink size={14} /> View Public Shop
              </Link>
            )}
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} /> Add New Product
            </button>
          </div>
        </div>

        {/* Status Callout Banner */}
        {isPending && (
          <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl flex items-start gap-3.5 text-xs text-amber-950">
            <Clock size={22} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-extrabold text-sm">Shop Status: Pending Review by Mega Bazar Super Admin</p>
              <p className="leading-relaxed text-amber-900">
                Your shop application for <strong>{currentShop.name}</strong> is currently pending manual review by Platform Owner Muhammad Moiz. Review typically completes within 24 hours. You may prepare your catalog items below now; they will become publicly visible as soon as your storefront is approved.
              </p>
              <p className="font-mono text-[11px] text-amber-800 pt-1">
                Assigned Storefront Path: <strong>megabazaar.com/shop/{currentShop.slug}</strong>
              </p>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="p-5 bg-rose-50 border border-rose-200 rounded-3xl flex items-start gap-3.5 text-xs text-rose-950">
            <AlertCircle size={22} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-extrabold text-sm">Action Required: Shop Application Not Approved</p>
              <p className="leading-relaxed text-rose-900">
                Feedback from Super Admin:{' '}
                <strong>{currentShop.rejectionReason || 'Please verify your contact details and physical address.'}</strong>
              </p>
              <Link href="/open-shop" className="inline-block pt-1 font-bold text-blue-600 underline">
                Update &amp; Resubmit Shop Profile →
              </Link>
            </div>
          </div>
        )}

        {isApproved && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4 text-xs text-emerald-950">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>
                <strong>Your storefront is live!</strong> Customers across Pakistan can browse your products and place Cash on Delivery orders.
              </span>
            </div>
            <span className="font-mono font-bold text-emerald-800 shrink-0">
              /shop/{currentShop.slug}
            </span>
          </div>
        )}

        {/* Metric Cards for Seller */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-xs font-bold text-slate-500">My Products</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{sellerProducts.length}</p>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">In your shop catalogue</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-xs font-bold text-slate-500">Customer Orders</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{sellerOrders.length}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Cash on delivery ready</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-xs font-bold text-slate-500">Commission Rate</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{currentShop.commissionRate || '5%'}</p>
            <p className="text-[11px] text-slate-400 mt-1">Standard marketplace fee</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-xs font-bold text-slate-500">WhatsApp Inquiry Hotline</p>
            <p className="text-sm font-bold text-emerald-600 mt-2 truncate">+{currentShop.phone}</p>
            <p className="text-[11px] text-slate-400 mt-1">Customer direct chat</p>
          </div>
        </div>

        {/* Products Management Table for this seller */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">My Product Inventory</h2>
              <p className="text-xs text-slate-500">Products listed exclusively under {currentShop.name}</p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Add Product
            </button>
          </div>

          {sellerProducts.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Package size={32} className="text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No products added yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add your first item to start selling. When your shop is approved, it will automatically show on your storefront.
              </p>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                + Add First Product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Stock</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sellerProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-semibold text-slate-900 flex items-center gap-3">
                        <img
                          src={p.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80'}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="truncate max-w-xs">{p.name}</p>
                          <span className="text-[10px] text-slate-400">{p.sku}</span>
                        </div>
                      </td>
                      <td className="py-3 text-slate-600">{p.category}</td>
                      <td className="py-3 font-bold text-slate-900">{formatCurrency(p.price, settings.currency)}</td>
                      <td className="py-3">{p.stock} units</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Orders Table for this seller */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">Shop Orders</h2>
            <p className="text-xs text-slate-500">Orders placed by customers for your products</p>
          </div>

          {sellerOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
              No customer orders received yet. Once your shop is approved and live, customer orders will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="pb-3">Order #</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">City</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sellerOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="py-3 font-mono font-bold text-blue-600">{o.orderNumber}</td>
                      <td className="py-3 text-slate-900">{o.customerName}</td>
                      <td className="py-3 text-slate-600">{o.shippingAddress?.city || 'Pakistan'}</td>
                      <td className="py-3 font-bold">{formatCurrency(o.grandTotal, settings.currency)}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {o.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Add Product to {currentShop.name}</h3>
              <button onClick={() => setIsAddProductOpen(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Embroidered Lawn Kurti"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Units *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    min={50}
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Original / Retail Price (PKR)</label>
                  <input
                    type="number"
                    min={50}
                    value={prodOriginalPrice}
                    onChange={(e) => setProdOriginalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-700 mb-1">Product Photo *</label>
                <div className="flex items-center gap-3">
                  {prodImageUrl ? (
                    <div className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-white">
                      <img src={prodImageUrl} alt="Product preview" className="w-full h-full object-cover" />
                    </div>
                  ) : null}
                  <div className="flex-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors text-xs">
                      {isUploadingImage ? <Loader2 size={13} className="animate-spin text-blue-600" /> : <Upload size={13} />}
                      <span>{isUploadingImage ? 'Uploading to Storage...' : 'Upload Image File'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        disabled={isUploadingImage}
                        onChange={handleUploadProductImage}
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">JPG, PNG or WebP up to 10MB</p>
                  </div>
                </div>
                {uploadError && (
                  <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                    <AlertCircle size={13} /> {uploadError}
                  </p>
                )}
                <div>
                  <input
                    type="url"
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                    placeholder="Or enter direct image URL (https://...)"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
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
