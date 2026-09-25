import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StorageService } from '../storage/storage.service';
import { Tender } from './tender.schema';
import { CreateTenderDto, UpdateTenderDto } from './tenders.dto';

@Injectable()
export class TendersService {
  constructor(
    @InjectModel(Tender.name) private readonly model: Model<Tender>,
    private readonly storage: StorageService,
  ) {}

  findPublished() {
    return this.model.find({ published: true }).sort({ status: -1, deadline: 1, createdAt: -1 }).lean();
  }

  findAll() {
    return this.model.find().sort({ createdAt: -1 }).lean();
  }

  async create(dto: CreateTenderDto, document?: Express.Multer.File) {
    const stored = document ? await this.storage.upload(document, 'tenders') : null;
    return this.model
      .create({
        ...dto,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        documentUrl: stored?.url,
        documentPath: stored?.storagePath,
      })
      .then((doc) => doc.toObject());
  }

  async update(id: string, dto: UpdateTenderDto, document?: Express.Multer.File) {
    const current = await this.model.findById(id);
    if (!current) throw new NotFoundException('Tender not found');

    const update: Record<string, unknown> = { ...dto };
    update.deadline = dto.deadline ? new Date(dto.deadline) : undefined;

    if (document) {
      const stored = await this.storage.upload(document, 'tenders');
      update.documentUrl = stored.url;
      update.documentPath = stored.storagePath;
      if (current.documentPath) await this.storage.remove(current.documentPath);
    } else if (dto.removeDocument && current.documentPath) {
      update.documentUrl = undefined;
      update.documentPath = undefined;
      await this.storage.remove(current.documentPath);
    }
    delete update.removeDocument;

    return this.model.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true }).lean();
  }

  async remove(id: string) {
    const tender = await this.model.findByIdAndDelete(id).lean();
    if (!tender) throw new NotFoundException('Tender not found');
    if (tender.documentPath) await this.storage.remove(tender.documentPath);
    return { deleted: true };
  }
}
