import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { StorageService } from '../storage/storage.service';
import { Photo } from './photo.schema';
import { CreatePhotoDto, PhotoQueryDto, UpdatePhotoDto } from './photos.dto';

@Injectable()
export class PhotosService {
  constructor(
    @InjectModel(Photo.name) private readonly photoModel: Model<Photo>,
    private readonly storage: StorageService,
  ) {}

  findAll(query: PhotoQueryDto) {
    const filter: FilterQuery<Photo> = {};
    if (query.category) filter.category = query.category;
    if (query.featured !== undefined) filter.featured = query.featured;
    return this.photoModel.find(filter).sort({ createdAt: -1 }).lean();
  }

  categories() {
    return this.photoModel.distinct('category');
  }

  async create(dto: CreatePhotoDto, file: Express.Multer.File) {
    const stored = await this.storage.upload(file, 'photos');
    return this.photoModel.create({
      title: dto.title,
      caption: dto.caption ?? '',
      category: dto.category?.trim() || 'General',
      featured: dto.featured ?? false,
      ...stored,
    });
  }

  async update(id: string, dto: UpdatePhotoDto) {
    const photo = await this.photoModel.findByIdAndUpdate(id, dto, { new: true }).lean();
    if (!photo) throw new NotFoundException('Photo not found');
    return photo;
  }

  async remove(id: string) {
    const photo = await this.photoModel.findByIdAndDelete(id).lean();
    if (!photo) throw new NotFoundException('Photo not found');
    await this.storage.remove(photo.storagePath);
    return { deleted: true };
  }
}
