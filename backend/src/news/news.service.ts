import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContentService } from '../common/content.service';
import { StorageService } from '../storage/storage.service';
import { News } from './news.schema';

@Injectable()
export class NewsService extends ContentService<News> {
  constructor(@InjectModel(News.name) model: Model<News>, storage: StorageService) {
    super(model, storage, 'news', 'News article');
  }
}
