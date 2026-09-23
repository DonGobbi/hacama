import { Storage } from '@google-cloud/storage';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { dirname, extname, join, resolve } from 'path';

export const LOCAL_UPLOAD_DIR = resolve(process.cwd(), 'uploads');

export interface StoredFile {
  url: string;
  storagePath: string;
  contentType: string;
  size: number;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly storage: Storage;
  private readonly bucketName: string;
  private readonly publicBucket: boolean;
  private readonly useGcs: boolean;
  private readonly localBaseUrl: string;

  constructor(config: ConfigService) {
    const keyFilename = config.get<string>('GOOGLE_APPLICATION_CREDENTIALS') || undefined;
    this.storage = new Storage({
      projectId: config.get<string>('GCS_PROJECT_ID') || undefined,
      keyFilename,
    });
    this.bucketName = config.get<string>('GCS_BUCKET', '');
    this.publicBucket = config.get<string>('GCS_PUBLIC_BUCKET', 'true') === 'true';

    const bucketConfigured = !!this.bucketName && this.bucketName !== 'your-bucket-name';
    const keyAvailable = !keyFilename || existsSync(resolve(keyFilename));
    this.useGcs = bucketConfigured && keyAvailable;
    this.localBaseUrl = config.get<string>('PUBLIC_API_URL', `http://localhost:${config.get('PORT', 4000)}`);

    if (!this.useGcs) {
      this.logger.warn(
        `Google Cloud Storage not configured (${!bucketConfigured ? 'GCS_BUCKET missing' : `key file ${keyFilename} not found`}). ` +
          `Falling back to local disk: ${LOCAL_UPLOAD_DIR}`,
      );
    }
  }

  private get bucket() {
    if (!this.bucketName) {
      throw new InternalServerErrorException('GCS_BUCKET is not configured');
    }
    return this.storage.bucket(this.bucketName);
  }

  async upload(file: Express.Multer.File, folder: string): Promise<StoredFile> {
    const storagePath = `${folder}/${Date.now()}-${randomUUID()}${extname(file.originalname).toLowerCase()}`;

    if (!this.useGcs) {
      const target = join(LOCAL_UPLOAD_DIR, storagePath);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, file.buffer);
      const url = `${this.localBaseUrl}/uploads/${encodeURI(storagePath)}`;
      return { url, storagePath, contentType: file.mimetype, size: file.size };
    }

    const blob = this.bucket.file(storagePath);

    await blob.save(file.buffer, {
      contentType: file.mimetype,
      resumable: false,
      metadata: { cacheControl: 'public, max-age=31536000' },
    });

    // Private bucket: hand out a stable backend URL that redirects to a
    // short-lived signed URL on each request (see MediaController).
    const url = this.publicBucket
      ? `https://storage.googleapis.com/${this.bucketName}/${encodeURI(storagePath)}`
      : `${this.localBaseUrl}/api/media/${encodeURI(storagePath)}`;

    return { url, storagePath, contentType: file.mimetype, size: file.size };
  }

  /** Resolve a stored object to a readable URL (signed when the bucket is private). */
  async getReadUrl(storagePath: string): Promise<string> {
    if (!this.useGcs) {
      return `${this.localBaseUrl}/uploads/${encodeURI(storagePath)}`;
    }
    if (this.publicBucket) {
      return `https://storage.googleapis.com/${this.bucketName}/${encodeURI(storagePath)}`;
    }
    const [url] = await this.bucket.file(storagePath).getSignedUrl({
      action: 'read',
      expires: Date.now() + 1000 * 60 * 15,
    });
    return url;
  }

  async remove(storagePath: string): Promise<void> {
    try {
      if (!this.useGcs) {
        await unlink(join(LOCAL_UPLOAD_DIR, storagePath)).catch(() => undefined);
        return;
      }
      await this.bucket.file(storagePath).delete({ ignoreNotFound: true });
    } catch (error) {
      this.logger.warn(`Failed to delete ${storagePath}: ${(error as Error).message}`);
    }
  }
}
