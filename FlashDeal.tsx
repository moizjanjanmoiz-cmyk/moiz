'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Zap, ArrowRight, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useStore } from '@/context/StoreContext';

export const FlashDeal: React.FC = () => {
  const { products, settings, addToCart } = useStore();

  // Find demo flash product: Smart Watch Pro
  const flashProduct =
    products.find((p) => p.isFlashDeal || p.slug === 'smart-watch-pro') ||
    products[2] ||
    products[0];

  // Countdown timer state initialized to 02 DAYS, 12 HRS, 45 MINS, 30 SECS
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 12,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return { days: 2, hours: 12, minutes: 45, seconds: 30 }; // reset cycle
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDigits = (n: number) => n.toString().padStart(2, '0');

  return (
    <section className="py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-6 sm:p-8 shadow-xl">
          {/* Subtle background circuit or glow */}
          <div className="absolute top-0 right-1/4 -mt-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            {/* Left side: Product Image + Information */}
            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
              {/* Product Thumbnail */}
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-white/10 backdrop-blur-md p-2 border border-white/20 shrink-0 shadow-inner group">
                <div className="relative w-full h-full rounded-xl overflow-hidden bg-white">
                  <Image
                    src={flashProduct?.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80'}
                    alt="Smart Watch Pro"
                    fill
                    sizes="144px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {/* 40% OFF Floating Tag */}
                <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full shadow-sm">
                  -40% OFF
                </div>
              </div>

              {/* Deal Info */}
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1 text-amber-300 text-xs font-black tracking-wider uppercase">
                  <Zap className="w-4 h-4 fill-amber-300" />
                  Flash Deal &bull; Limited Time Offer
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {flashProduct?.name || 'Smart Watch Pro'}
                </h3>

                <div className="flex items-baseline justify-center sm:justify-start gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-amber-300">
                    {formatCurrency(flashProduct?.price || 42000, settings.currency)}
                  </span>
                  <span className="text-sm sm:text-base text-blue-200 line-through">
                    {formatCurrency(flashProduct?.originalPrice || 70000, settings.currency)}
                  </span>
                </div>

                <p className="text-xs text-blue-100 max-w-sm line-clamp-1">
                  1.95&quot; AMOLED Always-on Titanium Watch with Heart Rate &amp; GPS.
                </p>
              </div>
            </div>

            {/* Right side: Countdown Timer & Action Button */}
            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6" suppressHydrationWarning>
              {/* Working Countdown Clock */}
              <div className="flex items-center gap-2 sm:gap-2.5" suppressHydrationWarning>
                {/* Days */}
                <div className="flex flex-col items-center justify-center w-15 h-16 sm:w-17 sm:h-18 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-inner" suppressHydrationWarning>
                  <span className="text-xl sm:text-2xl font-black tracking-tight leading-none text-white">
                    {formatDigits(timeLeft.days)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-blue-200 tracking-wider mt-1">
                    DAYS
                  </span>
                </div>

                <span className="text-lg font-bold text-blue-300">:</span>

                {/* Hours */}
                <div className="flex flex-col items-center justify-center w-15 h-16 sm:w-17 sm:h-18 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-inner" suppressHydrationWarning>
                  <span className="text-xl sm:text-2xl font-black tracking-tight leading-none text-white">
                    {formatDigits(timeLeft.hours)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-blue-200 tracking-wider mt-1">
                    HRS
                  </span>
                </div>

                <span className="text-lg font-bold text-blue-300">:</span>

                {/* Mins */}
                <div className="flex flex-col items-center justify-center w-15 h-16 sm:w-17 sm:h-18 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-inner" suppressHydrationWarning>
                  <span className="text-xl sm:text-2xl font-black tracking-tight leading-none text-white">
                    {formatDigits(timeLeft.minutes)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-blue-200 tracking-wider mt-1">
                    MINS
                  </span>
                </div>

                <span className="text-lg font-bold text-blue-300">:</span>

                {/* Secs */}
                <div className="flex flex-col items-center justify-center w-15 h-16 sm:w-17 sm:h-18 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-inner" suppressHydrationWarning>
                  <span className="text-xl sm:text-2xl font-black tracking-tight leading-none text-amber-300">
                    {formatDigits(timeLeft.seconds)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-blue-200 tracking-wider mt-1">
                    SECS
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-2" suppressHydrationWarning>
                <Link
                  href={flashProduct ? `/product/${flashProduct.id}` : '/deals'}
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-slate-950 font-black rounded-2xl shadow-lg shadow-amber-400/30 text-xs sm:text-sm tracking-wide transition-all whitespace-nowrap flex items-center gap-2"
                >
                  Shop the Deal
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {flashProduct && (
                  <button
                    onClick={() => addToCart(flashProduct, 1)}
                    suppressHydrationWarning
                    className="p-3.5 bg-white/20 hover:bg-white/30 text-white rounded-2xl transition-colors"
                    title="Add directly to cart"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
