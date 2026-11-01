import { supabase, isSupabaseConfigured } from './client';

export interface UploadResult {
  success: boolean;
  url: string;
  path?: string;
  error?: string;
  isFallback?: boolean;
}

export interface UploadOptions {
  bucket?: string;
  folder?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
  fallbackToClientWebP?: boolean;
}

const DEFAULT_BUCKET = 'mb-product-images';
const DEFAULT_MAX_SIZE_MB = 10;
const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

/**
 * Compresses an image into a clean studio-grade WebP format using client-side canvas.
 * Acts as an instant offline/network resilience fallback.
 */
export async function compressImageToDataUrl(file: File, maxDimension: number = 1000): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const raw = e.target?.result as string;
      if (!raw) return reject(new Error('Failed to read image file'));

      const img = new window.Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(raw);

          // Clean white canvas background for professional e-commerce presentation
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Export compressed WebP (or fallback to JPEG if browser doesn't support WebP export)
          const webpData = canvas.toDataURL('image/webp', 0.88);
          resolve(webpData.startsWith('data:image/webp') ? webpData : canvas.toDataURL('image/jpeg', 0.88));
        } catch {
          resolve(raw);
        }
      };
      img.onerror = () => resolve(raw);
      img.src = raw;
    };
    reader.onerror = () => reject(new Error('Could not read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Directly uploads any image (picture, portrait, logo, banner, receipt) to Supabase Storage.
 * Includes complete validation, informative error reporting, and automatic resilience.
 */
export async function uploadImageToSupabase(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const bucket = options.bucket || DEFAULT_BUCKET;
  const folder = options.folder || '';
  const maxSizeMB = options.maxSizeMB || DEFAULT_MAX_SIZE_MB;
  const allowedTypes = options.allowedTypes || DEFAULT_ALLOWED_TYPES;
  const fallbackToClientWebP = options.fallbackToClientWebP !== false;

  // 1. Client-Side Format Validation
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      success: false,
      url: '',
      error: `Unsupported image format (${file.type || 'unknown'}). Please choose a valid JPG, PNG, or WebP photo.`,
    };
  }

  // 2. Client-Side Size Validation
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    const actualMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      success: false,
      url: '',
      error: `File size is ${actualMB} MB, which exceeds the ${maxSizeMB} MB limit. Please compress or select a smaller image.`,
    };
  }

  // 3. Check if Supabase connection is active
  if (!isSupabaseConfigured) {
    if (fallbackToClientWebP) {
      try {
        const localDataUrl = await compressImageToDataUrl(file);
        return {
          success: true,
          url: localDataUrl,
          isFallback: true,
          error: 'Saved in offline preview mode (Supabase credentials not configured in environment).',
        };
      } catch (err: any) {
        return {
          success: false,
          url: '',
          error: err.message || 'Image processing failed in offline mode.',
        };
      }
    }
    return {
      success: false,
      url: '',
      error: 'Supabase storage is not configured in your environment settings.',
    };
  }

  // 4. Unique, safe filename generation
  const cleanExt = (file.name.split('.').pop() || 'webp').toLowerCase().replace(/[^a-z0-9]/g, '');
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;
  const storagePath = folder ? `${folder.replace(/^\/|\/$/g, '')}/${uniqueName}` : uniqueName;

  // 5. Direct Supabase Storage Upload
  try {
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, file, {
        cacheControl: '31536000',
        upsert: true,
        contentType: file.type || 'image/webp',
      });

    if (uploadError) {
      console.warn(`Supabase Storage upload to bucket '${bucket}' encountered issue:`, uploadError.message);

      // Analyze specific Supabase error cases
      let friendlyError = uploadError.message;
      if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('The resource was not found')) {
        friendlyError = `Supabase Storage bucket '${bucket}' was not found. Please create the public bucket in your Supabase dashboard or SQL editor.`;
      } else if (uploadError.message.includes('row-level security') || uploadError.message.includes('policy')) {
        friendlyError = `Storage upload rejected by policy. Please make sure bucket '${bucket}' is set to Public with upload permissions.`;
      } else if (uploadError.message.includes('Payload too large')) {
        friendlyError = 'Image exceeds Supabase Storage single-file payload limit.';
      }

      // If fallback enabled, compress locally so user never loses work or experiences crashes
      if (fallbackToClientWebP) {
        try {
          const localDataUrl = await compressImageToDataUrl(file);
          return {
            success: true,
            url: localDataUrl,
            isFallback: true,
            error: friendlyError,
          };
        } catch {}
      }

      return {
        success: false,
        url: '',
        error: friendlyError,
      };
    }

    // 6. Get Public Accessible URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(storagePath);

    if (!publicUrlData?.publicUrl) {
      throw new Error('Supabase Storage did not return a public URL.');
    }

    return {
      success: true,
      url: publicUrlData.publicUrl,
      path: storagePath,
    };
  } catch (err: any) {
    console.error('Network error during Supabase upload:', err);

    if (fallbackToClientWebP) {
      try {
        const localDataUrl = await compressImageToDataUrl(file);
        return {
          success: true,
          url: localDataUrl,
          isFallback: true,
          error: 'Network error connecting to Supabase. Image preserved in local storage.',
        };
      } catch {}
    }

    return {
      success: false,
      url: '',
      error: err.message || 'Network connection to Supabase Storage failed.',
    };
  }
}
