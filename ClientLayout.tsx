'use client';

import React from 'react';
import { StoreProvider } from '@/context/StoreContext';

export const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StoreProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </div>
    </StoreProvider>
  );
};
