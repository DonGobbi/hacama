import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContentService } from '../common/content.service';
import { StorageService } from '../storage/storage.service';
import { Testimonial } from './testimonial.schema';

@Injectable()
export class TestimonialsService extends ContentService<Testimonial> {
  constructor(@InjectModel(Testimonial.name) model: Model<Testimonial>, storage: StorageService) {
    super(model, storage, 'testimonials', 'Testimonial');
  }
}
