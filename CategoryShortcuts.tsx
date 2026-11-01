'use client';

import React from 'react';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import { useStore } from '@/context/StoreContext';
import { MoreHorizontal } from 'lucide-react';

export const CategoryShortcuts: React.FC = () => {
  const { categories } = useStore();

  return (
    <section className="py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Horizontal scroll container on mobile, responsive flex/grid on desktop */}
        <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto no-scrollbar pb-2 pt-1 scroll-smooth">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="flex flex-col items-center gap-2 group shrink-0"
            >
              {/* Category Circle/Square Image Container */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1.5 border border-slate-200/80 shadow-2xs group-hover:shadow-md group-hover:border-blue-400 group-hover:-translate-y-1 transition-all duration-200 flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-50">
                  <SafeImage
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 64px, 80px"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    fallbackSrc="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80"
                  />
                </div>
              </div>
              {/* Category Title */}
              <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition-colors text-center whitespace-nowrap">
                {cat.name}
              </span>
            </Link>
          ))}

          {/* "All" button matching reference design */}
          <Link
            href="/products"
            className="flex flex-col items-center gap-2 group shrink-0"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 hover:bg-blue-50 border border-slate-200/80 shadow-2xs group-hover:shadow-md group-hover:border-blue-400 group-hover:-translate-y-1 transition-all duration-200 flex items-center justify-center">
              <MoreHorizontal className="w-7 h-7 text-slate-500 group-hover:text-blue-600 transition-colors" />
            </div>
            <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition-colors text-center whitespace-nowrap">
              All
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};
