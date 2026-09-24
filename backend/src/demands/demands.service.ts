import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContentService } from '../common/content.service';
import { StorageService } from '../storage/storage.service';
import { Demand } from './demand.schema';

@Injectable()
export class DemandsService extends ContentService<Demand> {
  constructor(@InjectModel(Demand.name) model: Model<Demand>, storage: StorageService) {
    super(model, storage, 'demands', 'Demand');
  }

  override findPublished() {
    return this.model.find({ published: true }).sort({ status: -1, order: 1, createdAt: -1 }).lean();
  }
}
