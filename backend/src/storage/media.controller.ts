import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { StorageService } from './storage.service';

/**
 * Public file serving for private GCS buckets.
 * Stored URLs look like /api/media/<folder>/<file>; each request is
 * redirected to a short-lived signed URL (or the local /uploads path
 * when running on disk storage).
 */
@Controller('media')
export class MediaController {
  constructor(private readonly storage: StorageService) {}

  @Get(':folder/:file')
  async serve(
    @Param('folder') folder: string,
    @Param('file') file: string,
    @Res() res: Response,
  ): Promise<void> {
    const url = await this.storage.getReadUrl(`${folder}/${file}`);
    res.redirect(url);
  }
}
