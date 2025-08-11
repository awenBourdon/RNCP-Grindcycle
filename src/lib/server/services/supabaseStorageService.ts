import { createClient } from '@supabase/supabase-js';
import { UPLOAD_CONFIG } from '@/lib/server/config/upload';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface StorageUploadResult {
  success: boolean;
  publicUrl?: string;
  error?: string;
}

export interface StorageBatchResult {
  success: boolean;
  results: StorageUploadResult[];
  successfulUploads: string[];
  errors: string[];
}

export class SupabaseStorageService {
  private bucketName: string;
  private static bucketInitialized = false;

  constructor(directory: keyof typeof UPLOAD_CONFIG.supabaseFolders) {
    this.bucketName = UPLOAD_CONFIG.supabaseFolders[directory];
  }

  private async ensureBucketExists(): Promise<void> {
    if (SupabaseStorageService.bucketInitialized) return;

    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(
        bucket => bucket.name === 'grindcycle-images'
      );

      if (!bucketExists) {

        const { error } = await supabase.storage.createBucket(
          'grindcycle-images',
          {
            public: true,
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
            fileSizeLimit: 5242880,
          }
        );

        if (error && !error.message.includes('already exists')) {
          throw new Error(`Erreur création bucket: ${error.message}`);
        }
      }

      SupabaseStorageService.bucketInitialized = true;
    } catch (err) {
        console.error(err instanceof Error ? err.message : err);
      throw err;
    }
  }

  async uploadSingle(file: File): Promise<StorageUploadResult> {
    try {
      await this.ensureBucketExists();

      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}_${file.name}`;
      const filePath = `${this.bucketName}/${fileName}`;

      const { error } = await supabase.storage
        .from('grindcycle-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('grindcycle-images').getPublicUrl(filePath);

      return {
        success: true,
        publicUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  async uploadMultiple(files: File[]): Promise<StorageBatchResult> {
    const results: StorageUploadResult[] = [];
    const successfulUploads: string[] = [];
    const errors: string[] = [];

    for (const [index, file] of files.entries()) {
      const result = await this.uploadSingle(file);
      results.push(result);

      if (result.success && result.publicUrl) {
        successfulUploads.push(result.publicUrl);
      } else {
        errors.push(`Image ${index + 1}: ${result.error || 'Erreur inconnue'}`);
      }
    }

    if (errors.length > 0 && successfulUploads.length > 0) {
      await this.deleteMultiple(successfulUploads);
      return {
        success: false,
        results,
        successfulUploads: [],
        errors,
      };
    }

    return {
      success: errors.length === 0,
      results,
      successfulUploads,
      errors,
    };
  }

  async deleteSingle(url: string): Promise<boolean> {
    try {
      const filePath = this.extractFilePathFromUrl(url);
      if (!filePath) return false;

      const { error } = await supabase.storage
        .from('grindcycle-images')
        .remove([filePath]);

      return !error;
    } catch {
      return false;
    }
  }

  async deleteMultiple(
    urls: string[]
  ): Promise<{ deleted: string[]; failed: string[] }> {
    const deleted: string[] = [];
    const failed: string[] = [];

    for (const url of urls) {
      const success = await this.deleteSingle(url);
      if (success) {
        deleted.push(url);
      } else {
        failed.push(url);
      }
    }

    return { deleted, failed };
  }

  private extractFilePathFromUrl(url: string): string | null {
    const match = url.match(
      /\/storage\/v1\/object\/public\/grindcycle-images\/(.+)$/
    );
    return match ? match[1] : null;
  }
}
