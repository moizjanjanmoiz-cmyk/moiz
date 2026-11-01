'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SafeImage from '@/components/SafeImage';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { X, Trash2, Plus, Minus, Heart, ShoppingBag, ArrowRight, Tag, Check, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    toggleWishlist,
    isInWishlist,
    cartSubtotal,
    cartDiscount,
    cartShipping,
    cartGrandTotal,
    cartCount,
    settings,
    applyCoupon,
    removeCoupon,
    activeCoupon,
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ msg: string; isError: boolean } | null>(null);

  const freeShippingThreshold = settings.freeShippingThreshold || 5000;
  const progressPercent = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode);
    setCouponFeedback({
      msg: res.message,
      isError: !res.success,
    });
    if (res.success) {
      setCouponCode('');
    }
  };

  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Shopping Cart <span className="text-blue-600 font-semibold">({cartCount})</span>
                </h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress Indicator */}
            <div className="bg-blue-50/80 px-4 py-3 border-b border-blue-100/60">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 mb-1.5">
                <Truck className="w-4 h-4 text-blue-600" />
                {remainingForFreeShipping > 0 ? (
                  <span>
                    Add <span className="text-blue-700 font-bold">{formatCurrency(remainingForFreeShipping, settings.currency)}</span> more for <strong className="text-emerald-600">FREE Shipping</strong>!
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Congratulations! You unlocked FREE shipping!
                  </span>
                )}
              </div>
              <div className="w-full bg-blue-200/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-slate-100">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Your cart is empty</h3>
                    <p className="text-sm text-slate-500 max-w-xs mt-1">
                      Looks like you haven&apos;t added any items to your shopping cart yet.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-md shadow-blue-500/20"
                  >
                    Start Shopping
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                cart.map((item) => {
                  const inWish = isInWishlist(item.productId);
                  const itemKey = `${item.productId}-${item.selectedSize || 'default'}`;
                  return (
                    <div key={itemKey} className="pt-4 first:pt-0 flex gap-3.5 group">
                      {/* Product Thumbnail */}
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60">
                        <SafeImage
                          src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80'}
                          alt={item.product.name}
                          fill
                          sizes="80px"
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/product/${item.product.id}`}
                              onClick={() => setIsCartOpen(false)}
                              className="text-sm font-semibold text-slate-900 line-clamp-1 hover:text-blue-600 transition-colors"
                            >
                              {item.product.name}
                            </Link>
                            <button
                              onClick={() => removeFromCart(item.productId, item.selectedSize)}
                              className="text-slate-400 hover:text-red-500 transition-colors p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            <p className="text-xs text-slate-500">{item.product.category}</p>
                            {(item.selectedSize || item.product.size || item.product.attributes?.size || item.product.specifications?.Size || item.product.specifications?.size) && (
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                Size: {item.selectedSize || item.product.size || item.product.attributes?.size || item.product.specifications?.Size || item.product.specifications?.size}
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-sm font-bold text-slate-900">
                              {formatCurrency(item.product.price, settings.currency)}
                            </span>
                            {item.product.originalPrice > item.product.price && (
                              <span className="text-xs text-slate-400 line-through">
                                {formatCurrency(item.product.originalPrice, settings.currency)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Controls: Quantity +/- and Wishlist move */}
                        <div className="flex items-center justify-between mt-2 pt-1">
                          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                            <button
                              onClick={() => updateCartQuantity(item.productId, item.quantity - 1, item.selectedSize)}
                              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-l-lg transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-semibold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.productId, item.quantity + 1, item.selectedSize)}
                              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-r-lg transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => toggleWishlist(item.productId)}
                            className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                              inWish ? 'text-rose-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${inWish ? 'fill-rose-500 text-rose-500' : ''}`} />
                            {inWish ? 'Saved' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer with Summary & Checkout */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 space-y-3.5">
                {/* Coupon input */}
                <div>
                  {activeCoupon ? (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                        <Tag className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Code &quot;{activeCoupon.code}&quot; active ({activeCoupon.discountType === 'percentage' ? `${activeCoupon.value}% OFF` : `-${formatCurrency(activeCoupon.value, settings.currency)}`})</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-xs text-red-600 hover:underline font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Promo code (e.g. MEGA10)"
                          className="w-full pl-3 pr-2 py-2 text-xs uppercase bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition-colors shrink-0"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                  {couponFeedback && (
                    <p className={`text-[11px] mt-1 ${couponFeedback.isError ? 'text-red-500' : 'text-emerald-600'}`}>
                      {couponFeedback.msg}
                    </p>
                  )}
                </div>

                {/* Subtotals */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(cartSubtotal, settings.currency)}</span>
                  </div>
                  {cartDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount</span>
                      <span>-{formatCurrency(cartDiscount, settings.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-semibold text-slate-800">
                      {cartShipping === 0 ? (
                        <span className="text-emerald-600 font-bold uppercase">Free</span>
                      ) : (
                        formatCurrency(cartShipping, settings.currency)
                      )}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-900">Grand Total</span>
                    <span className="text-lg font-black text-blue-600">
                      {formatCurrency(cartGrandTotal, settings.currency)}
                    </span>
                  </div>
                </div>

                {/* Checkout & Continue Buttons */}
                <div className="space-y-2 pt-1">
                  <Link
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors text-center"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
