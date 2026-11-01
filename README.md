# Mega Bazar - Online Marketplace 🛒🇵🇰

Mega Bazar is a modern, full-stack multi-vendor e-commerce platform built for the Pakistani market, featuring authentic local merchants, direct WhatsApp order channels, and comprehensive Pakistani payment gateways (Cash on Delivery, EasyPaisa, and JazzCash).

## 🚀 Key Features

- **Storefront & Product Catalog:** Real-time search, category navigation, dynamic price slider, brand filtering, and flash deals countdown.
- **Interactive Multi-Angle Gallery:** High-resolution product images with zoom modal and thumbnail switcher.
- **Pakistani Payment Methods:** Cash on Delivery (COD), EasyPaisa, JazzCash (Till ID: `984488781`), and Card.
- **WhatsApp Direct Inquiries:** Deep-link integrations (`wa.me`) with pre-filled product details, SKU, and size selection.
- **Multi-Vendor Seller Hub:** 2-minute seller onboarding (`/open-shop`), personal storefront link (`/shop/[slug]`), and seller dashboard (`/seller/dashboard`).
- **Super Admin Suite (`/admin`):** 12 management modules including shop approvals, catalog management, customer orders, platform commission (5%), and dispute resolution.
- **Supabase Backend Integration:** Real-time Postgres database, Row Level Security (RLS), and database-level seller privilege protection triggers.

---

## 🛠️ Tech Stack

- **Framework:** React 19 (TypeScript) on Vite
- **Styling:** Tailwind CSS v4
- **Database & Auth:** Supabase (PostgreSQL + RLS + GoTrue Auth)
- **Icons & Animation:** Lucide Icons & Motion (Framer Motion)
- **Utilities:** Canvas Confetti, CLSX, Tailwind Merge

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
NEXT_PUBLIC_MARKETPLACE_ENABLED="true"

# App Base URL
APP_URL="https://your-domain.com"

# Gemini API Key (Optional)
GEMINI_API_KEY="your-gemini-key"
```

---

## 💻 Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Verify TypeScript compilation:**
   ```bash
   npm run lint
   ```

---

## 🛡️ Database Setup & Migrations

The database migration script is provided in `scripts/marketplace-setup-review.sql`. Run it in your Supabase SQL Editor to set up:
- `mb_shops` table with automated trigger-based field protection.
- `mb_public_shops` secure barrier view for public visitors.
- `mb_admin_events` audit logging.
- RLS policies enforcing `app_metadata ->> 'role' = 'super_admin'`.
