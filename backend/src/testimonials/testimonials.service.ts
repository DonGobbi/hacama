import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContentService } from '../common/content.service';
import { MailService } from '../mail/mail.service';
import { StorageService } from '../storage/storage.service';
import { Testimonial } from './testimonial.schema';
import { SubmitTestimonialDto } from './testimonials.dto';

@Injectable()
export class TestimonialsService extends ContentService<Testimonial> {
  constructor(
    @InjectModel(Testimonial.name) private readonly testimonialModel: Model<Testimonial>,
    storage: StorageService,
    private readonly mail: MailService,
  ) {
    super(testimonialModel, storage, 'testimonials', 'Testimonial');
  }

  /** Public submission: saved unpublished so an admin reviews it before it shows on the site. */
  async submit(dto: SubmitTestimonialDto) {
    if (dto.website) return { submitted: true }; // honeypot: pretend it worked

    await this.testimonialModel.create({
      quote: dto.quote,
      name: dto.name,
      role: dto.role ?? '',
      organization: dto.organization ?? '',
      published: false,
    });

    this.mail.notifyAdmin(
      `New testimonial awaiting review: ${dto.name}`,
      `<p><b>${this.mailEsc(dto.name)}</b>${dto.organization ? ` (${this.mailEsc(dto.organization)})` : ''} submitted a testimonial.</p><p>"${this.mailEsc(dto.quote)}"</p><p>It is hidden until you publish it in Admin → Testimonials.</p>`,
    );
    return { submitted: true };
  }

  private mailEsc(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
