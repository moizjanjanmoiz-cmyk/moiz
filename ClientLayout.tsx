'use client';

import React, { useEffect } from 'react';
import { StoreProvider, useStore } from '@/context/StoreContext';
import { Navbar } from './Navbar';
import { CartDrawer } from './CartDrawer';
import { MobileBottomNav } from './MobileBottomNav';
import { Footer } from './Footer';

import { DiscreetAdminAccess } from './DiscreetAdminAccess';
import { usePathname } from 'next/navigation';

function AdminSessionGuard() {
  const pathname = usePathname();
  const { logoutAdmin } = useStore();

  useEffect(() => {
    // Strictly invalidate admin session if visitor or admin navigates outside /admin
    if (pathname && !pathname.startsWith('/admin')) {
      logoutAdmin();
    }
  }, [pathname, logoutAdmin]);

  return null;
}

export const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  // Automatic recovery for chunk version mismatches across builds/restarts
  useEffect(() => {
    const handleChunkError = (event: ErrorEvent) => {
      const msg = event?.message || '';
      if (
        msg.includes('Loading chunk') ||
        msg.includes('ChunkLoadError') ||
        msg.includes('failed to fetch dynamically imported module')
      ) {
        // Prevent infinite reload loops
        const lastReload = sessionStorage.getItem('last_chunk_reload');
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload, 10) > 8000) {
          sessionStorage.setItem('last_chunk_reload', now.toString());
          window.location.reload();
        }
      }
    };

    window.addEventListener('error', handleChunkError);
    return () => window.removeEventListener('error', handleChunkError);
  }, []);

  return (
    <StoreProvider>

      <div
        className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white"
        suppressHydrationWarning
      >
        {/* Render Customer Header unless on Admin dashboard pages */}
        {!isAdminRoute && <Navbar />}

        {/* Main Content Area */}
        <main className="flex-1" suppressHydrationWarning>
          {children}
        </main>

        {/* Global Cart Slide-over */}
        <CartDrawer />

        {/* Customer Footer unless on Admin pages */}
        {!isAdminRoute && <Footer />}

        {/* Customer Mobile Bottom Navigation Bar */}
        {!isAdminRoute && <MobileBottomNav />}

        {/* Global Floating WhatsApp Direct Customer Support Button */}


        {/* Discreet Corner Access for Admin */}
        <DiscreetAdminAccess />
      </div>
    </StoreProvider>
  );
};

