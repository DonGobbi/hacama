import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MailService } from '../mail/mail.service';
import { Subscriber } from './subscriber.schema';
import { SubscribeDto } from './subscribers.dto';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectModel(Subscriber.name) private readonly subscriberModel: Model<Subscriber>,
    private readonly mail: MailService,
  ) {}

  async subscribe(dto: SubscribeDto) {
    if (dto.website) return { subscribed: true }; // honeypot: pretend it worked

    const existing = await this.subscriberModel.exists({ email: dto.email });
    if (existing) return { subscribed: true, already: true };

    try {
      await this.subscriberModel.create({ email: dto.email });
    } catch {
      // Unique-index race or duplicate: still a success for the visitor.
      return { subscribed: true, already: true };
    }

    this.mail.notifyAdmin(
      `New newsletter subscriber: ${dto.email}`,
      `<p>New subscriber: <b>${dto.email.replace(/[<>&"]/g, '')}</b></p><p>See the admin dashboard → Subscribers.</p>`,
    );
    return { subscribed: true };
  }

  findAll() {
    return this.subscriberModel.find().sort({ createdAt: -1 }).lean();
  }

  async remove(id: string) {
    const doc = await this.subscriberModel.findByIdAndDelete(id).lean();
    if (!doc) throw new NotFoundException('Subscriber not found');
    return { deleted: true };
  }
}
