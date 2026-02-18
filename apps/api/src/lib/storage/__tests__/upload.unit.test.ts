import type { UploadOptions } from '../upload';
import { TestR2Bucket } from 'cloudflare-test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dataUrlToFile, uploadFile } from '../upload';

// Helper to create mock File
function createMockFile(name: string, type: string, size: number = 1024): File {
  const content = new Uint8Array(size);
  return new File([content], name, { type });
}

describe('uploadFile', () => {
  let mockBucket: TestR2Bucket;
  let mockEnv: { PLAY_GRID_BUCKET: TestR2Bucket; R2_PUBLIC_URL: string };

  beforeEach(() => {
    vi.clearAllMocks();
    mockBucket = new TestR2Bucket();
    mockBucket.put.mockResolvedValue(undefined);
    mockEnv = { PLAY_GRID_BUCKET: mockBucket, R2_PUBLIC_URL: 'https://r2.playgrid.mohdalaa.com' };
  });

  describe('successful uploads', () => {
    it('should upload a banner image successfully', async () => {
      const file = createMockFile('test-banner.jpg', 'image/jpeg', 1024 * 1024); // 1MB
      const options: UploadOptions = { category: 'banner' };

      const result = await uploadFile(file, options, mockEnv);

      expect(mockBucket.put).toHaveBeenCalledWith(
        expect.stringMatching(/^marketing\/banner\/[a-f0-9-]+.jpg$/),
        expect.any(Object),
        {
          httpMetadata: {
            contentType: 'image/jpeg',
          },
        },
      );
      expect(result).toMatchObject({
        url: expect.stringMatching(/^https:\/\/r2\.playgrid\.mohdalaa\.com\/marketing\/banner\/[a-f0-9-]+.jpg$/),
        key: expect.stringMatching(/^marketing\/banner\/[a-f0-9-]+.jpg$/),
        size: 1024 * 1024,
        type: 'image/jpeg',
      });
    });

    it('should upload an avatar image successfully', async () => {
      const file = createMockFile('avatar.png', 'image/png', 512 * 1024); // 512KB
      const options: UploadOptions = { category: 'avatar' };

      const result = await uploadFile(file, options, mockEnv);

      expect(mockBucket.put).toHaveBeenCalledWith(
        expect.stringMatching(/^user\/avatar\/[a-f0-9-]+.png$/),
        expect.any(Object),
        {
          httpMetadata: {
            contentType: 'image/png',
          },
        },
      );
      expect(result.key).toMatch(/^user\/avatar\/[a-f0-9-]+.png$/);
    });

    it('should upload a document successfully', async () => {
      const file = createMockFile('document.pdf', 'application/pdf', 2 * 1024 * 1024); // 2MB
      const options: UploadOptions = { category: 'document' };

      const result = await uploadFile(file, options, mockEnv);

      expect(mockBucket.put).toHaveBeenCalledWith(
        expect.stringMatching(/^content\/document\/[a-f0-9-]+.pdf$/),
        expect.any(Object),
        {
          httpMetadata: {
            contentType: 'application/pdf',
          },
        },
      );
      expect(result.key).toMatch(/^content\/document\/[a-f0-9-]+.pdf$/);
    });

    it('should use custom keyPrefix when provided', async () => {
      const file = createMockFile('test.jpg', 'image/jpeg');
      const options: UploadOptions = {
        category: 'image',
        keyPrefix: 'custom/prefix',
      };

      const result = await uploadFile(file, options, mockEnv);

      expect(result.key).toMatch(/^custom\/prefix\/[a-f0-9-]+.jpg$/);
    });
  });

  describe('file type validation', () => {
    it('should reject invalid file type for banner category', async () => {
      const file = createMockFile('test.txt', 'text/plain');
      const options: UploadOptions = { category: 'banner' };

      await expect(uploadFile(file, options, mockEnv)).rejects.toThrow(
        'Invalid file type. Allowed types: image/jpeg, image/png, image/webp, image/gif',
      );
      expect(mockBucket.put).not.toHaveBeenCalled();
    });

    it('should accept valid file types for logo category', async () => {
      const file = createMockFile('logo.svg', 'image/svg+xml');
      const options: UploadOptions = { category: 'logo' };

      await expect(uploadFile(file, options, mockEnv)).resolves.toBeDefined();
      expect(mockBucket.put).toHaveBeenCalled();
    });

    it('should bypass type validation when allowedTypes is overridden', async () => {
      const file = createMockFile('test.txt', 'text/plain');
      const options: UploadOptions = {
        category: 'banner',
        allowedTypes: ['text/plain'],
      };

      await expect(uploadFile(file, options, mockEnv)).resolves.toBeDefined();
      expect(mockBucket.put).toHaveBeenCalled();
    });
  });

  describe('file size validation', () => {
    it('should reject file too large for avatar category', async () => {
      const file = createMockFile('large-avatar.jpg', 'image/jpeg', 2 * 1024 * 1024); // 2MB (over 1MB limit)
      const options: UploadOptions = { category: 'avatar' };

      await expect(uploadFile(file, options, mockEnv)).rejects.toThrow(
        'File too large. Maximum size is 1MB',
      );
      expect(mockBucket.put).not.toHaveBeenCalled();
    });

    it('should accept file within size limit', async () => {
      const file = createMockFile('small-avatar.jpg', 'image/jpeg', 512 * 1024); // 512KB (under 1MB limit)
      const options: UploadOptions = { category: 'avatar' };

      await expect(uploadFile(file, options, mockEnv)).resolves.toBeDefined();
      expect(mockBucket.put).toHaveBeenCalled();
    });

    it('should bypass size validation when maxSize is overridden', async () => {
      const file = createMockFile('large-file.jpg', 'image/jpeg', 20 * 1024 * 1024); // 20MB
      const options: UploadOptions = {
        category: 'avatar',
        maxSize: 50 * 1024 * 1024, // 50MB
      };

      await expect(uploadFile(file, options, mockEnv)).resolves.toBeDefined();
      expect(mockBucket.put).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle upload failure', async () => {
      mockBucket.put.mockRejectedValue(new Error('R2 upload failed'));
      const file = createMockFile('test.jpg', 'image/jpeg');
      const options: UploadOptions = { category: 'image' };

      await expect(uploadFile(file, options, mockEnv)).rejects.toThrow(
        'Failed to upload file',
      );
    });
  });

  describe('file extension handling', () => {
    it('should handle files without extensions', async () => {
      const file = createMockFile('file-without-ext', 'image/jpeg');
      const options: UploadOptions = { category: 'image' };

      const result = await uploadFile(file, options, mockEnv);

      expect(result.key).toMatch(/\.jpg$/);
    });

    it('should handle uppercase extensions', async () => {
      const file = createMockFile('test.PNG', 'image/png');
      const options: UploadOptions = { category: 'image' };

      const result = await uploadFile(file, options, mockEnv);

      expect(result.key).toMatch(/\.png$/);
    });
  });
});

describe('dataUrlToFile', () => {
  it('should convert data URL to File object', async () => {
    const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAoACgDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAMEB//EACUQAAIBAwMEAwEBAAAAAAAAAAECAwAEEQUSITFBURNhcZEigf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8A4+iiigAooooAKKKKACiiigAooooAKKKKACiiigD/2Q==';
    const filename = 'test-image.jpg';

    const file = await dataUrlToFile(dataUrl, filename);

    expect(file).toBeInstanceOf(File);
    expect(file.name).toBe(filename);
    expect(file.type).toBe('image/jpeg');
    expect(file.size).toBeGreaterThan(0);
  });

  it('should handle PNG data URL', async () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    const filename = 'test.png';

    const file = await dataUrlToFile(dataUrl, filename);

    expect(file.type).toBe('image/png');
    expect(file.name).toBe(filename);
  });

  it('should handle text/plain data URL', async () => {
    const dataUrl = 'data:text/plain;base64,SGVsbG8gV29ybGQ='; // "Hello World" base64
    const filename = 'hello.txt';

    const file = await dataUrlToFile(dataUrl, filename);

    expect(file.type).toBe('text/plain');
    expect(file.name).toBe(filename);
  });
});
