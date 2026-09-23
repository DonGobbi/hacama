import { NotFoundException } from '@nestjs/common';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { StorageService } from '../storage/storage.service';

export interface ContentBase {
  published: boolean;
  order: number;
  imageUrl?: string;
  imagePath?: string;
}

export abstract class ContentService<T extends ContentBase> {
  protected constructor(
    protected readonly model: Model<T>,
    protected readonly storage: StorageService,
    private readonly folder: string,
    private readonly label: string,
  ) {}

  findPublished() {
    return this.model
      .find({ published: true } as FilterQuery<T>)
      .sort({ order: 1, createdAt: -1 })
      .lean();
  }

  findAll() {
    return this.model.find().sort({ order: 1, createdAt: -1 }).lean();
  }

  async create(dto: object, file?: Express.Multer.File) {
    const image = file ? await this.upload(file) : {};
    const doc = await this.model.create({ ...dto, ...image });
    return doc.toObject();
  }

  async update(id: string, dto: { removeImage?: boolean }, file?: Express.Multer.File) {
    const existing = (await this.model.findById(id).lean()) as unknown as ContentBase | null;
    if (!existing) throw new NotFoundException(`${this.label} not found`);

    const { removeImage, ...data } = dto;
    const patch: Record<string, unknown> = { $set: { ...data } };

    if (file) {
      Object.assign(patch.$set as object, await this.upload(file));
    } else if (removeImage) {
      patch.$unset = { imageUrl: 1, imagePath: 1 };
    }

    const updated = await this.model
      .findByIdAndUpdate(id, patch as UpdateQuery<T>, { new: true, runValidators: true })
      .lean();

    if ((file || removeImage) && existing.imagePath) await this.storage.remove(existing.imagePath);
    return updated;
  }

  async remove(id: string) {
    const existing = (await this.model.findByIdAndDelete(id).lean()) as unknown as ContentBase | null;
    if (!existing) throw new NotFoundException(`${this.label} not found`);
    if (existing.imagePath) await this.storage.remove(existing.imagePath);
    return { deleted: true };
  }

  private async upload(file: Express.Multer.File) {
    const stored = await this.storage.upload(file, this.folder);
    return { imageUrl: stored.url, imagePath: stored.storagePath };
  }
}
