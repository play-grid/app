import type { AppEnv } from '@/lib/types';
import { randomUUID } from 'node:crypto';

/**
 * Upload options for different file categories
 */
export interface UploadOptions {
  /** File category for organized storage */
  category: 'banner' | 'logo' | 'avatar' | 'document' | 'image';
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Allowed MIME types */
  allowedTypes?: string[];
  /** Custom key prefix (overrides category default) */
  keyPrefix?: string;
}

/**
 * Upload result
 */
export interface UploadResult {
  url: string;
  key: string;
  size: number;
  type: string;
}

/**
 * File category configurations
 */
const CATEGORY_CONFIGS: Record<UploadOptions['category'], Omit<UploadOptions, 'category'>> = {
  banner: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    keyPrefix: 'marketing/banner',
  },
  logo: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    keyPrefix: 'brand/logo',
  },
  avatar: {
    maxSize: 1 * 1024 * 1024, // 1MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    keyPrefix: 'user/avatar',
  },
  document: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    keyPrefix: 'content/document',
  },
  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
    keyPrefix: 'content/image',
  },
};

/**
 * Upload a file to R2 storage
 *
 * @param file - The file to upload
 * @param options - Upload configuration
 * @param env - Cloudflare environment with BANNERS_BUCKET
 * @returns Upload result with URL and metadata
 */
export async function uploadFile(
  file: File,
  options: UploadOptions,
  env: Pick<AppEnv['Bindings'], 'PLAY_GRID_BUCKET' | 'R2_PUBLIC_URL'>,
): Promise<UploadResult> {
  const config = CATEGORY_CONFIGS[options.category];

  // Merge with provided options
  const finalOptions = {
    ...config,
    ...options,
  };

  // Validate file type
  if (finalOptions.allowedTypes && !finalOptions.allowedTypes.includes(file.type)) {
    throw new Error(
      `Invalid file type. Allowed types: ${finalOptions.allowedTypes.join(', ')}`,
    );
  }

  // Validate file size
  if (finalOptions.maxSize && file.size > finalOptions.maxSize) {
    const maxSizeMB = finalOptions.maxSize / (1024 * 1024);
    throw new Error(`File too large. Maximum size is ${maxSizeMB}MB`);
  }

  const bucket = env.PLAY_GRID_BUCKET;

  // Generate unique key
  const parts = file.name.split('.');
  const fileExtension = parts.length > 1 ? parts.pop()?.toLowerCase() || 'jpg' : 'jpg';
  const fileId = randomUUID();
  const key = `${finalOptions.keyPrefix}/${fileId}.${fileExtension}`;

  try {
    // Upload to R2
    await bucket.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Generate public URL using environment variable
    const url = `${env.R2_PUBLIC_URL}/${key}`;

    return {
      url,
      key,
      size: file.size,
      type: file.type,
    };
  }
  catch (error) {
    console.error('Failed to upload file to R2:', error);
    throw new Error('Failed to upload file');
  }
}

/**
 * Convert data URL to File object
 *
 * @param dataUrl - Base64 data URL
 * @param filename - Original filename
 * @returns File object
 */
export async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  // Extract MIME type from data URL
  const mimeType = dataUrl.split(',')[0].split(':')[1].split(';')[0];

  return new File([blob], filename, { type: mimeType });
}
