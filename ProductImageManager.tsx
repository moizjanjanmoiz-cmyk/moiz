'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Upload,
  Plus,
  Trash2,
  Star,
  ArrowLeft,
  ArrowRight,
  Eye,
  AlertCircle,
  FileImage,
  Link as LinkIcon,
  X,
  CheckCircle2,
  Maximize2,
  Sparkles,
  Layers,
  Loader2,
} from 'lucide-react';
import { uploadImageToSupabase } from '@/lib/supabase/storage';

interface ProductImageManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  productName?: string;
  minImages?: number;
  maxImages?: number;
  onTriggerAiAutoFill?: () => void;
}

export const ProductImageManager: React.FC<ProductImageManagerProps> = ({
  images,
  onChange,
  productName = 'product',
  minImages = 1,
  maxImages = 8,
  onTriggerAiAutoFill,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter out completely empty items to get clean valid image list
  const validImages = images.filter((img) => img && img.trim().length > 0);
  const validCount = validImages.length;
  const isMinMet = validCount >= minImages;
  const isMaxReached = validCount >= maxImages;

  // Real client-side canvas optimizer fallback if server is unreachable
  const processClientFallback = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const raw = e.target?.result as string;
        if (!raw) return reject(new Error('Failed to read file.'));

        const img = new window.Image();
        img.onload = () => {
          const targetSize = 1000;
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(raw);

          // Fill clean studio white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, targetSize, targetSize);

          // Calculate centered contain coordinates
          const scale = Math.min(targetSize / img.width, targetSize / img.height);
          const drawW = img.width * scale;
          const drawH = img.height * scale;
          const drawX = (targetSize - drawW) / 2;
          const drawY = (targetSize - drawH) / 2;

          ctx.drawImage(img, drawX, drawY, drawW, drawH);
          resolve(canvas.toDataURL('image/webp', 0.90));
        };
        img.onerror = () => resolve(raw);
        img.src = raw;
      };
      reader.onerror = () => reject(new Error('File reading error.'));
      reader.readAsDataURL(file);
    });
  };

  // Upload handler via FormData to /api/upload
  const handleFiles = async (fileList: FileList | File[]) => {
    setErrorMessage(null);
    const files = Array.from(fileList);
    if (files.length === 0) return;

    if (validCount + files.length > maxImages) {
      setErrorMessage(
        `Maximum limit of ${maxImages} images reached. You already have ${validCount} images and cannot add ${files.length} more.`
      );
      return;
    }

    // Validate types and sizes
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    for (const file of files) {
      if (!validMimes.includes(file.type.toLowerCase())) {
        setErrorMessage(
          `"${file.name}" has an unsupported format. Please upload JPG, PNG, or WEBP images only.`
        );
        return;
      }
      if (file.size > 12 * 1024 * 1024) {
        setErrorMessage(
          `"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Maximum allowed size is 12 MB.`
        );
        return;
      }
    }

    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];
      const errorNotes: string[] = [];

      for (const file of files) {
        const result = await uploadImageToSupabase(file, {
          bucket: 'mb-product-images',
          folder: 'products',
          maxSizeMB: 12,
        });

        if (result.success && result.url) {
          uploadedUrls.push(result.url);
          if (result.isFallback && result.error) {
            errorNotes.push(result.error);
          }
        } else if (result.error) {
          errorNotes.push(result.error);
        }
      }

      if (uploadedUrls.length > 0) {
        const newImages = [...validImages, ...uploadedUrls].slice(0, maxImages);
        onChange(newImages);
      }

      if (errorNotes.length > 0) {
        setErrorMessage(errorNotes[0]);
      }
    } catch (err: any) {
      console.warn('Image upload error:', err);
      try {
        const fallbacks: string[] = [];
        for (const file of files) {
          const url = await processClientFallback(file);
          fallbacks.push(url);
        }
        const combined = [...validImages, ...fallbacks].slice(0, maxImages);
        onChange(combined);
      } catch (fallbackErr: any) {
        setErrorMessage(fallbackErr.message || 'Could not process images.');
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleManualAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = manualUrl.trim();
    if (!trimmed) return;

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/')) {
      setErrorMessage('Please enter a valid image web URL starting with http://, https://, or /');
      return;
    }

    if (validCount >= maxImages) {
      setErrorMessage(`Maximum limit of ${maxImages} images reached.`);
      return;
    }

    onChange([...validImages, trimmed]);
    setManualUrl('');
    setShowUrlInput(false);
    setErrorMessage(null);
  };

  const handleRemoveImage = (index: number) => {
    const updated = validImages.filter((_, idx) => idx !== index);
    onChange(updated);
    setErrorMessage(null);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const target = validImages[index];
    const rest = validImages.filter((_, idx) => idx !== index);
    onChange([target, ...rest]);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= validImages.length) return;
    const updated = [...validImages];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-6">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
        }}
      />

      {/* Header section with counts and status badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Product Images
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold transition-colors ${
                    isMinMet
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {validCount} / {minImages} Required (Max {maxImages})
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Upload at least {minImages} images. You can add multiple views of the product.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isMaxReached}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>Upload Images</span>
          </button>

          {onTriggerAiAutoFill && (
            <button
              type="button"
              onClick={onTriggerAiAutoFill}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md ring-2 ring-purple-300 animate-pulse transition-all cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>✨ Auto-Fill with AI</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            disabled={isMaxReached}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>{showUrlInput ? 'Cancel URL' : 'Add Web URL'}</span>
          </button>
        </div>
      </div>

      {/* Manual URL Input dropdown if toggled */}
      {showUrlInput && (
        <form
          onSubmit={handleManualAddUrl}
          className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 animate-fade-in"
        >
          <label className="block text-xs font-bold text-slate-700">
            Paste Direct Image Web URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or /images/..."
              className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Add URL
            </button>
          </div>
        </form>
      )}

      {/* Error alert */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium flex items-center justify-between gap-2 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-800 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Status banner when below required minimum */}
      {!isMinMet && (
        <div className="p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl text-xs text-amber-800 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-semibold">
            Please upload at least {minImages} product images ({minImages - validCount} more required to save and publish).
          </span>
        </div>
      )}

      {/* Drag & Drop Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => !isMaxReached && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all ${
          isMaxReached
            ? 'opacity-60 cursor-not-allowed border-slate-200 bg-slate-50'
            : isDragging
            ? 'border-blue-500 bg-blue-50/70 scale-[1.008] cursor-copy'
            : 'border-slate-300/80 hover:border-blue-500 hover:bg-blue-50/30 bg-slate-50/50 cursor-pointer'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-extrabold text-slate-800">
              {isUploading
                ? 'Uploading & optimizing product images...'
                : isMaxReached
                ? `Maximum limit of ${maxImages} images reached`
                : 'Click to browse or drag & drop product photos here'}
            </p>

            {/* Recommended Size & Dimensions Card */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 pt-1 pb-1">
              <span className="px-2.5 py-1 bg-blue-100/80 text-blue-800 text-[11px] font-black rounded-lg border border-blue-200 shadow-2xs">
                📐 Recommended: 800 × 800 px (1:1 Square)
              </span>
              <span className="px-2.5 py-1 bg-emerald-100/80 text-emerald-800 text-[11px] font-black rounded-lg border border-emerald-200 shadow-2xs">
                📁 Max Size: 12 MB / photo
              </span>
              <span className="px-2.5 py-1 bg-purple-100/80 text-purple-800 text-[11px] font-black rounded-lg border border-purple-200 shadow-2xs">
                🖼️ JPG, PNG, WEBP
              </span>
            </div>

            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Images are automatically optimized and compressed to WebP for high-speed mobile loading and crisp display.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1 text-[11px] font-bold text-slate-400">
            <span>• High Resolution</span>
            <span>• Fast CDN Loading</span>
            <span>• Multi-Angle Views</span>
          </div>
        </div>
      </div>

      {/* Image Gallery Grid with Reordering, Main Image, and Removal */}
      {validCount > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Uploaded Images ({validCount} of {maxImages})
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Image #1 is your <strong className="text-slate-800">Main Cover Image</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {validImages.map((url, idx) => {
              const isMain = idx === 0;

              return (
                <div
                  key={`${url}-${idx}`}
                  className={`group relative rounded-2xl border-2 transition-all overflow-hidden flex flex-col bg-slate-50 shadow-2xs ${
                    isMain
                      ? 'border-amber-400 ring-2 ring-amber-300/40 bg-amber-50/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Image Aspect Box */}
                  <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                    <Image
                      src={url}
                      alt={`Product image ${idx + 1}`}
                      fill
                      unoptimized
                      sizes="220px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />

                    {/* Main / Cover Badge */}
                    {isMain ? (
                      <div className="absolute top-2 left-2 z-10 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
                        <Star className="w-3 h-3 fill-slate-950" />
                        <span>Main Image</span>
                      </div>
                    ) : (
                      <div className="absolute top-2 left-2 z-10 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                        #{idx + 1}
                      </div>
                    )}

                    {/* Top Right Quick Actions (Preview & Remove) */}
                    <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setPreviewModalUrl(url)}
                        className="w-7 h-7 bg-white/90 hover:bg-white text-slate-800 rounded-lg flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                        title="Zoom / Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="w-7 h-7 bg-white/90 hover:bg-rose-600 text-slate-700 hover:text-white rounded-lg flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between gap-1.5">
                    {/* Set as Main button */}
                    {!isMain ? (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(idx)}
                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[10px] rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        title="Set as Main Cover Image"
                      >
                        <Star className="w-3 h-3 text-amber-600" />
                        <span>Set Main</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-amber-600" /> Cover
                      </span>
                    )}

                    {/* Move controls */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 'left')}
                        disabled={idx === 0}
                        className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-500 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Move Left"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 'right')}
                        disabled={idx === validImages.length - 1}
                        className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-500 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Move Right"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col items-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 px-2 text-white border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300">Image High-Res Preview</span>
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full h-[65vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black/50 mt-3">
              <Image
                src={previewModalUrl}
                alt="Enlarged preview"
                fill
                unoptimized
                className="object-contain rounded-xl p-2"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
