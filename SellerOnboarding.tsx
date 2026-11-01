'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { generateShopSlug, formatPakistaniWhatsAppNumber } from '@/lib/utils';
import { uploadImageToSupabase } from '@/lib/supabase/storage';
import {
  Store,
  Eye,
  EyeOff,
  Upload,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  User,
  AlertCircle,
} from 'lucide-react';

export function SellerOnboarding() {
  const router = useRouter();
  const { user, login, registerShop, shops } = useStore();

  // Form fields (Strictly the 7 simple fields requested)
  const [fullName, setFullName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shopName, setShopName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [description, setDescription] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedShop, setSubmittedShop] = useState<any>(null);

  // Auto-fill if user logs in during session
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.displayName);
      if (!email) setEmail(user.email);
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user]);

  // Check if current user already has a shop submitted
  const existingShop = shops.find(
    (s) =>
      (user?.email && s.email.toLowerCase() === user.email.toLowerCase()) ||
      (user?.uid && s.ownerId === user.uid)
  );

  const previewSlug = generateShopSlug(shopName || 'my-shop-name');

  const [isLogoUploading, setIsLogoUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLogoUploading(true);
    setErrorMessage('');

    try {
      const result = await uploadImageToSupabase(file, {
        bucket: 'mb-product-images',
        folder: 'logos',
        maxSizeMB: 5,
      });

      if (result.success && result.url) {
        setLogoPreview(result.url);
        if (result.isFallback && result.error) {
          console.warn('Logo saved with note:', result.error);
        }
      } else {
        setErrorMessage(result.error || 'Failed to upload shop logo.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error uploading shop logo.');
    } finally {
      setIsLogoUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanShop = shopName.trim();
    const cleanCity = city.trim();
    const cleanAddress = address.trim();
    const cleanPhone = phone.trim();

    if (!cleanName || !cleanEmail || !cleanShop || !cleanCity || !cleanAddress) {
      setErrorMessage('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    // Validate Pakistani Phone
    const phoneValid = formatPakistaniWhatsAppNumber(cleanPhone);
    if (!phoneValid.isValid) {
      setErrorMessage(phoneValid.error || 'Please enter a valid Pakistani mobile number (e.g., 03001234567).');
      setIsSubmitting(false);
      return;
    }

    // If user is not authenticated, validate password and sign up
    if (!user) {
      if (!password || password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        setIsSubmitting(false);
        return;
      }

      if (isSupabaseConfigured) {
        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: cleanEmail,
            password: password.trim(),
            options: {
              data: {
                role: 'seller',
                display_name: cleanName,
                phone: phoneValid.formatted,
              },
            },
          });
          if (authError) {
            // If user already registered, inform them
            if (authError.message.toLowerCase().includes('already registered')) {
              setErrorMessage('An account with this email already exists. Please log in first or use a different email.');
              setIsSubmitting(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Supabase auth signup attempt:', err);
        }
      }

      // Establish session in store context
      login(cleanEmail, 'seller', cleanName);
    }

    try {
      const result = await registerShop({
        fullName: cleanName,
        phone: phoneValid.formatted,
        email: cleanEmail,
        shopName: cleanShop,
        city: cleanCity,
        address: cleanAddress,
        logoUrl: logoPreview || undefined,
        description: description.trim() || `${cleanShop} - Multi-vendor seller on Mega Bazar`,
      });

      setSubmittedShop(result.shop);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to submit shop registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user already has a shop or just submitted one, show status banner
  const activeDisplayShop = submittedShop || existingShop;

  if (activeDisplayShop) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-lg space-y-6 text-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Clock size={32} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider rounded-full">
            <Clock size={13} /> Status: {activeDisplayShop.status} Approval
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {activeDisplayShop.status === 'Approved' ? 'Shop is Approved & Live!' : 'Shop Application Under Review'}
          </h1>

          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            {activeDisplayShop.status === 'Approved' ? (
              <>
                Congratulations! Your shop <strong>{activeDisplayShop.name}</strong> is live on Mega Bazar. You can now manage your catalog, view customer orders, and receive buyer inquiries.
              </>
            ) : (
              <>
                Thank you, <strong>{activeDisplayShop.ownerName}</strong>! Your application for <strong>{activeDisplayShop.name}</strong> has been submitted securely to Mega Bazar. It is now awaiting review by Platform Owner <strong>Muhammad Moiz</strong>.
              </>
            )}
          </p>

          {/* Shop Card Summary */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500">Shop Name:</span>
              <span className="font-bold text-slate-900">{activeDisplayShop.name}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500">Assigned Shop URL:</span>
              <span className="font-mono font-bold text-blue-600">megabazaar.com/shop/{activeDisplayShop.slug}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500">Location:</span>
              <span className="font-medium text-slate-800">{activeDisplayShop.city}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">WhatsApp Hotline:</span>
              <span className="font-bold text-emerald-600">+{activeDisplayShop.phone}</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Link
              href="/seller/dashboard"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              Open Seller Dashboard <ArrowRight size={15} />
            </Link>
            {activeDisplayShop.status === 'Approved' && (
              <Link
                href={`/shop/${activeDisplayShop.slug}`}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                View Public Storefront →
              </Link>
            )}
            <Link
              href="/"
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header Banner */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <Store size={14} /> Open Your Shop on Mega Bazar
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Start Selling to Millions Across Pakistan
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Simple 2-minute registration. No complex paperwork or CNIC copies needed to get started. Dedicated seller dashboard and direct customer WhatsApp connections.
          </p>
        </div>

        {/* Existing Account Notice */}
        {user ? (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
              <span>
                You are signed in as <strong>{user.email}</strong>. We will automatically link this shop to your account.
              </span>
            </div>
            <span className="font-bold text-emerald-800 shrink-0">Account Active</span>
          </div>
        ) : null}

        {/* Registration Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs">
          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Error:</strong> {errorMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <User size={18} className="text-blue-600" /> 1. Seller Information
              </h2>
              <p className="text-xs text-slate-500 mt-1">Your personal contact details for store management.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Muhammad Moiz"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  WhatsApp / Mobile Number (+92) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03001234567 or +923001234567"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-hidden"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  disabled={Boolean(user)}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seller@example.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-hidden disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>

              {/* Password field only if not already logged in */}
              {!user && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Account Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-b border-slate-100 pb-4 pt-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Store size={18} className="text-blue-600" /> 2. Shop Details &amp; Address
              </h2>
              <p className="text-xs text-slate-500 mt-1">Your storefront identity and pickup address.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Shop Name *
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Royal Fashion Boutique"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-hidden"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Suggested URL: <span className="font-mono text-blue-600 font-bold">megabazaar.com/shop/{previewSlug}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Karachi, Lahore, Islamabad, Faisalabad"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Shop / Pickup Address *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Shop number, Plaza / Street address, Area"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-hidden"
              />
            </div>

            {/* Optional Logo Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Shop Logo (Optional)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <Store size={24} className="text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                    <Upload size={14} /> Upload Logo File
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>
                  <p className="text-[11px] text-slate-400 mt-1">Recommended: Square JPG or PNG under 4MB.</p>
                </div>
              </div>
            </div>

            {/* Terms Reassurance */}
            <div className="p-4 bg-blue-50 rounded-2xl text-xs text-blue-900 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Mega Bazar Seller Policy:</strong> Your shop will be submitted for manual review by Platform Owner Muhammad Moiz. Approval ensures fair customer service, genuine product standards, and verified dispatch.
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <span>Submitting Registration...</span>
              ) : (
                <>
                  <Store size={16} /> Submit Shop Registration for Approval
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
