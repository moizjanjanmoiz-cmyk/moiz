import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, 'src');

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env': {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://casfqhokrvzvgdfcjeeq.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_SlsiVRx6iNLDxeFo7poHRQ__maGogUU',
        VITE_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://casfqhokrvzvgdfcjeeq.supabase.co',
        VITE_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_SlsiVRx6iNLDxeFo7poHRQ__maGogUU',
        NEXT_PUBLIC_MARKETPLACE_ENABLED: 'true',
        APP_URL: process.env.APP_URL || '',
      },
    },
    resolve: {
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
      alias: {
        '@': srcDir,
        'next/link': path.resolve(srcDir, 'router/link.tsx'),
        'next/image': path.resolve(srcDir, 'router/image.tsx'),
        'next/navigation': path.resolve(srcDir, 'router/navigation.ts'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
