import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { ContentService } from '../common/content.service';
import { StorageService } from '../storage/storage.service';
import { Demand } from './demand.schema';
import { CreateDemandDto } from './demands.dto';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

@Injectable()
export class DemandsService extends ContentService<Demand> {
  constructor(@InjectModel(Demand.name) model: Model<Demand>, storage: StorageService) {
    super(model, storage, 'demands', 'Demand');
  }

  override findPublished() {
    return this.model.find({ published: true }).sort({ status: -1, order: 1, createdAt: -1 }).lean();
  }

  async findPublicBySlug(slug: string) {
    const demand = await this.model.findOne({ slug, published: true }).lean();
    if (!demand) throw new NotFoundException('Demand not found');
    return demand;
  }

  override create(dto: CreateDemandDto, file?: Express.Multer.File) {
    const slug = `${slugify(dto.title)}-${randomBytes(3).toString('hex')}`;
    return super.create({ ...dto, slug }, file);
  }
}
