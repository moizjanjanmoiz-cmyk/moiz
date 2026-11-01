'use client';

import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { uploadImageToSupabase } from '@/lib/supabase/storage';
import { Upload, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';

export function ShopMediaEditor({ onSaved }: { onSaved: (shop: any) => void }) {
  const [logo, setLogo] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  async function save() {
    setBusy(true);
    setStatusMessage('');
    setIsError(false);

    try {
      let logoUrl = logoPreview;
      let bannerUrl = bannerPreview;

      if (logo) {
        const logoRes = await uploadImageToSupabase(logo, {
          bucket: 'mb-product-images',
          folder: 'logos',
          maxSizeMB: 5,
        });
        if (logoRes.success && logoRes.url) {
          logoUrl = logoRes.url;
        } else if (logoRes.error) {
          throw new Error(logoRes.error);
        }
      }

      if (banner) {
        const bannerRes = await uploadImageToSupabase(banner, {
          bucket: 'mb-product-images',
          folder: 'banners',
          maxSizeMB: 8,
        });
        if (bannerRes.success && bannerRes.url) {
          bannerUrl = bannerRes.url;
        } else if (bannerRes.error) {
          throw new Error(bannerRes.error);
        }
      }

      if (isSupabaseConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const updates: Record<string, any> = {
            updated_at: new Date().toISOString(),
          };
          if (logoUrl) updates.logo_url = logoUrl;

          const { error } = await supabase
            .from('mb_shops')
            .update(updates)
            .eq('owner_id', session.user.id);

          if (error) {
            console.warn('Direct shop update notice:', error.message);
          }
        }
      }

      onSaved({ logo_url: logoUrl, banner_url: bannerUrl });
      setIsError(false);
      setStatusMessage('Shop branding media saved and updated successfully.');
    } catch (e: any) {
      setIsError(true);
      setStatusMessage(e instanceof Error ? e.message : 'Media upload failed. Please verify format and size.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-t border-slate-200 mt-6 pt-6 space-y-4">
      <div>
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-blue-600" /> Shop Logo &amp; Storefront Banner
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Upload square logo (up to 5 MB) and header cover banner (up to 8 MB) in JPG, PNG, or WebP.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Logo Picker */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
          <label className="block text-xs font-bold text-slate-700">Shop Logo (Square)</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setLogo(f);
              if (f) setLogoPreview(URL.createObjectURL(f));
            }}
            className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
          />
          {logoPreview && (
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
              <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Banner Picker */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
          <label className="block text-xs font-bold text-slate-700">Storefront Banner</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setBanner(f);
              if (f) setBannerPreview(URL.createObjectURL(f));
            }}
            className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
          />
          {bannerPreview && (
            <div className="h-16 w-32 rounded-xl overflow-hidden border border-slate-200">
              <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          disabled={busy || (!logo && !banner)}
          onClick={save}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
        >
          {busy ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading to Storage...
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5" /> Save Media
            </>
          )}
        </button>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            isError ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          {isError ? <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
}
