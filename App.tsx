import React from 'react';
import { RouterProvider, useRouterContext } from './router/router-context.tsx';
import { ClientLayout } from './components/ClientLayout.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { ProductsPage } from './pages/ProductsPage.tsx';
import { CategoriesPage } from './pages/CategoriesPage.tsx';
import { CategoryPage } from './pages/CategoryPage.tsx';
import { ProductDetailPage } from './pages/ProductDetailPage.tsx';
import { CartPage } from './pages/CartPage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage.tsx';
import { DemoShopsPage } from './pages/DemoShopsPage.tsx';
import { DemoShopDetailPage } from './pages/DemoShopDetailPage.tsx';
import { OpenShopPage } from './pages/OpenShopPage.tsx';
import { SellerDashboardPage } from './pages/SellerDashboardPage.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { WishlistPage } from './pages/WishlistPage.tsx';
import { OrdersPage } from './pages/OrdersPage.tsx';
import { AboutPage, ContactPage, PrivacyTermsPage, AuthPage, ResetPasswordPage } from './pages/InfoPages.tsx';

function AppRoutes() {
  const { pathname } = useRouterContext();

  // Normalize path
  const path = pathname.toLowerCase().replace(/\/$/, '') || '/';

  if (path === '/') {
    return <HomePage />;
  }

  if (path === '/products' || path === '/search' || path === '/deals') {
    return <ProductsPage />;
  }

  if (path === '/categories') {
    return <CategoriesPage />;
  }

  if (path.startsWith('/category/')) {
    return <CategoryPage />;
  }

  if (path.startsWith('/product/')) {
    return <ProductDetailPage />;
  }

  if (path === '/cart') {
    return <CartPage />;
  }

  if (path === '/checkout') {
    return <CheckoutPage />;
  }

  if (path.startsWith('/order-confirmation')) {
    return <OrderConfirmationPage />;
  }

  if (path === '/shop/preview' || path === '/shops') {
    return <DemoShopsPage />;
  }

  if (path.startsWith('/demo-shops/') || (path.startsWith('/shop/') && path !== '/shop/preview')) {
    return <DemoShopDetailPage />;
  }

  if (path === '/open-shop' || path === '/seller/products/new') {
    return <OpenShopPage />;
  }

  if (path === '/seller/dashboard') {
    return <SellerDashboardPage />;
  }

  if (path.startsWith('/admin')) {
    return <AdminDashboard />;
  }

  if (path === '/account/wishlist') {
    return <WishlistPage />;
  }

  if (path === '/account/orders' || path === '/account') {
    return <OrdersPage />;
  }

  if (path === '/about') {
    return <AboutPage />;
  }

  if (path === '/contact') {
    return <ContactPage />;
  }

  if (path === '/privacy') {
    return <PrivacyTermsPage type="privacy" />;
  }

  if (path === '/terms') {
    return <PrivacyTermsPage type="terms" />;
  }

  if (path === '/login') {
    return <AuthPage mode="login" />;
  }

  if (path === '/register') {
    return <AuthPage mode="register" />;
  }

  if (path === '/reset-password' || path === '/auth/reset-password') {
    return <ResetPasswordPage />;
  }

  // Fallback to Home
  return <HomePage />;
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
