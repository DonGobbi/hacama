import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContentService } from '../common/content.service';
import { StorageService } from '../storage/storage.service';
import { Partner } from './partner.schema';

@Injectable()
export class PartnersService extends ContentService<Partner> {
  constructor(@InjectModel(Partner.name) model: Model<Partner>, storage: StorageService) {
    super(model, storage, 'partners', 'Partner');
  }
}
