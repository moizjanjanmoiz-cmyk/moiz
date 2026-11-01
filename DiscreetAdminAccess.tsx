'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock } from 'lucide-react';

export const DiscreetAdminAccess: React.FC = () => {
  // Completely hidden from public store to keep Admin Panel strictly private
  return null;
};
