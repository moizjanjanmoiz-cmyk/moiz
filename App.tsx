import React, { useEffect, useMemo, useState } from 'react';
import { RouterProvider, useRouterContext } from './router/router-context.tsx';
import { ClientLayout } from './ClientLayout.tsx';
import { AdminDashboard } from './AdminDashboard.tsx';
import { SellerDashboardPage } from './SellerDashboardPage.tsx';

function AppRoutes() {
  const { pathname } = useRouterContext();
  const route = pathname || '/';

  if (route.startsWith('/admin')) {
    return <AdminDashboard />;
  }

  if (route.startsWith('/seller')) {
    return <SellerDashboardPage />;
  }

  return (
    <div className="min-h-screen">
      <header className="mb-hero">
        <div className="container-shell relative z-10 py-10 sm:py-16">
          <nav className="glass-card flex items-center justify-between gap-4 rounded-2xl px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-black text-white">M</div>
              <div>
                <div className="text-lg font-black tracking-tight text-slate-900">Mega Bazar</div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Pakistan</div>
              </div>
            </div>
            <div className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
              <a href="/">Home</a>
              <a href="/products">Products</a>
              <a href="/shops">Shops</a>
              <a href="/seller/dashboard">Seller</a>
              <a href="/admin">Admin</a>
            </div>
            <button className="btn-primary">Shop Now</button>
          </nav>

          <div className="mt-10 grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <span className="section-badge">Trusted marketplace</span>
              <h1 className="mt-5 max-w-xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                Shop smarter with Pakistan’s modern online marketplace.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-slate-600">
                Discover electronics, fashion, home essentials, and curated multi-vendor stores designed for convenience, trust, and modern commerce.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button className="btn-primary">Explore deals</button>
                <button className="btn-secondary">Open your shop</button>
              </div>
              <div className="mt-10 flex flex-wrap gap-8 text-sm text-slate-600">
                <div><span className="block text-2xl font-black text-slate-900">12k+</span> Products</div>
                <div><span className="block text-2xl font-black text-slate-900">500+</span> Verified shops</div>
                <div><span className="block text-2xl font-black text-slate-900">4.9/5</span> Buyer rating</div>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-5">
              <div className="rounded-2xl bg-slate-900 p-5 text-white">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-300">
                  <span>Flash deal</span>
                  <span>Ends soon</span>
                </div>
                <div className="mt-6 rounded-2xl bg-white/5 p-4">
                  <div className="h-44 rounded-xl bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.18),_transparent_55%),linear-gradient(135deg,_#1d4ed8,_#0ea5e9)]" />
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-slate-300">Premium gadget</div>
                      <div className="text-2xl font-black">PKR 24,999</div>
                    </div>
                    <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-900">-28%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container-shell py-12">
        <section className="grid gap-6 md:grid-cols-3">
          {[
            ['Same-day orders', 'Fast support and local logistics for the most popular Pakistan categories.'],
            ['Secure payments', 'COD, Easypaisa, JazzCash, and card options built for local buyers.'],
            ['Trusted sellers', 'Curated vendor network with approvals, scores, and shop protection.']
          ].map(([title, text]) => (
            <div key={title} className="product-card p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-700">✓</div>
              <h3 className="mb-2 text-xl font-black text-slate-900">{title}</h3>
              <p className="text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </section>

        <section className="mt-14">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <span className="section-badge">Popular categories</span>
              <h2 className="mt-4 text-3xl font-black text-slate-900">Fresh picks for your next order</h2>
            </div>
            <a href="/products" className="text-sm font-bold text-blue-700">Browse all</a>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Fashion', 'New arrivals'],
              ['Electronics', 'Smart tech'],
              ['Home & Living', 'Comfort essentials'],
              ['Beauty', 'Wellness picks']
            ].map(([title, tag]) => (
              <div key={title} className="product-card overflow-hidden">
                <div className="h-48 bg-[linear-gradient(135deg,_rgba(59,130,246,0.16),_rgba(14,165,233,0.12)),_radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_45%)]" />
                <div className="p-5">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{tag}</div>
                  <h3 className="mt-2 text-xl font-black text-slate-900">{title}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <ClientLayout>
        <AppRoutes />
      </ClientLayout>
    </RouterProvider>
  );
}
