import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Direct browser -> Supabase Storage upload for LANTANA.
 *
 * Uploads NEVER pass through a Next.js API route, so Vercel's 4.5MB
 * serverless request-body limit does not apply. Files are downscaled and
 * re-encoded to WebP in the browser before upload.
 *
 * Usage (client component only — needs `window`):
 *
 *   'use client';
 *   import { supabase } from '@/lib/supabase';
 *   import { uploadImage } from '@/lib/uploadImage';
 *
 *   const url = await uploadImage(supabase, file, {
 *     onProgress: (p) => setProgress(p),
 *   });
 */

const BUCKET = 'product-images';

export type UploadOptions = {
  /** Bucket name. Defaults to 'product-images'. */
  bucket?: string;
  /** Longest edge in pixels after downscaling. Defaults to 2400. */
  maxDimension?: number;
  /** WebP quality, 0–1. Defaults to 0.85. */
  quality?: number;
  /** Skip compression and upload the original bytes as-is. */
  skipCompression?: boolean;
  /** Hard ceiling in bytes for the *final* uploaded file. Defaults to 50MB. */
  maxBytes?: number;
  /** Called with 0–100 as the compression/upload progresses. */
  onProgress?: (percent: number) => void;
};

export type UploadResult = {
  url: string;
  path: string;
  bytes: number;
  originalBytes: number;
  width: number;
  height: number;
};

const DEFAULTS = {
  maxDimension: 2400,
  quality: 0.85,
  maxBytes: 50 * 1024 * 1024,
};

/** Strips accents/spaces/odd characters so the storage key stays URL-safe. */
function safeName(name: string): string {
  const base = name.replace(/\.[^.]+$/, '');
  return (
    base
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
      .slice(0, 60) || 'image'
  );
}

function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    // `imageOrientation` applies the EXIF rotation that iPhone photos carry.
    return createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not decode this image file.'));
    };
    img.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Image encoding failed.'))),
      type,
      quality
    );
  });
}

/**
 * Downscales to `maxDimension` on the longest edge and re-encodes as WebP.
 * Returns the original file untouched if the re-encode comes out larger.
 */
export async function compressImage(
  file: File,
  maxDimension = DEFAULTS.maxDimension,
  quality = DEFAULTS.quality
): Promise<{ blob: Blob; ext: string; width: number; height: number }> {
  const source = await loadBitmap(file);
  const sourceWidth = 'width' in source ? source.width : 0;
  const sourceHeight = 'height' in source ? source.height : 0;

  const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
  const width = Math.round(sourceWidth * scale);
  const height = Math.round(sourceHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable in this browser.');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source as CanvasImageSource, 0, 0, width, height);

  if ('close' in source && typeof source.close === 'function') source.close();

  const blob = await canvasToBlob(canvas, 'image/webp', quality);

  // A tiny PNG logo can grow when re-encoded — keep whichever is smaller.
  if (blob.size >= file.size && scale === 1) {
    const ext = (file.name.match(/\.([^.]+)$/)?.[1] || 'jpg').toLowerCase();
    return { blob: file, ext, width, height };
  }

  return { blob, ext: 'webp', width, height };
}

export async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const {
    bucket = BUCKET,
    maxDimension = DEFAULTS.maxDimension,
    quality = DEFAULTS.quality,
    skipCompression = false,
    maxBytes = DEFAULTS.maxBytes,
    onProgress,
  } = options;

  if (typeof window === 'undefined') {
    throw new Error('uploadImage must run in the browser, not on the server.');
  }
  if (!file.type.startsWith('image/')) {
    throw new Error(`"${file.name}" is not an image file.`);
  }

  onProgress?.(5);

  let blob: Blob = file;
  let ext = (file.name.match(/\.([^.]+)$/)?.[1] || 'jpg').toLowerCase();
  let width = 0;
  let height = 0;

  if (!skipCompression) {
    try {
      const compressed = await compressImage(file, maxDimension, quality);
      blob = compressed.blob;
      ext = compressed.ext;
      width = compressed.width;
      height = compressed.height;
    } catch {
      // Compression is an optimisation, not a gate — fall back to the original.
      blob = file;
    }
  }

  onProgress?.(40);

  if (blob.size > maxBytes) {
    const mb = (blob.size / 1048576).toFixed(1);
    const limit = Math.round(maxBytes / 1048576);
    throw new Error(`"${file.name}" is ${mb}MB after compression — the limit is ${limit}MB.`);
  }

  const path = `${Date.now()}-${safeName(file.name)}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType: blob.type || file.type,
    cacheControl: '31536000',
    upsert: false,
  });

  if (error) {
    throw new Error(`Upload failed for "${file.name}": ${error.message}`);
  }

  onProgress?.(90);

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  onProgress?.(100);

  return {
    url: publicUrl,
    path,
    bytes: blob.size,
    originalBytes: file.size,
    width,
    height,
  };
}

/** Uploads several files in sequence and reports overall progress. */
export async function uploadImages(
  supabase: SupabaseClient,
  files: File[],
  options: UploadOptions = {}
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const result = await uploadImage(supabase, files[i], {
      ...options,
      onProgress: (p) => options.onProgress?.(Math.round(((i + p / 100) / total) * 100)),
    });
    results.push(result);
  }

  return results;
}
