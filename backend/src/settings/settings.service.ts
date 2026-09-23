import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StorageService } from '../storage/storage.service';
import { UpdateSettingsDto } from './settings.dto';
import { Settings } from './settings.schema';

const DEFAULTS: Partial<Settings> = {
  phone: '+265 997 20 07 00',
  whatsapp: '+265 997 20 07 00',
  email: '',
  address: '',
  officeHours: '',
  stats: [],
  credentials: [],
  faqs: [
    {
      question: 'How do I request a quotation?',
      answer:
        'Use the Request a Quote form, list the items and quantities you need, and tell us where they should be delivered. We will get back to you with a quotation.',
    },
    {
      question: 'Do you deliver outside Lilongwe?',
      answer:
        'Tell us your delivery location when you request a quote and we will confirm the available delivery options and costs in your quotation.',
    },
    {
      question: 'Can you handle bulk or tender orders?',
      answer:
        'Yes. We are a registered supplier with the Public Procurement and Disposal of Assets Authority (PPDA) and welcome bulk, institutional, and tender requests.',
    },
    {
      question: 'What payment terms do you offer?',
      answer: 'Payment terms are agreed for each order and confirmed in your quotation.',
    },
  ],
};

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name) private readonly settingsModel: Model<Settings>,
    private readonly storage: StorageService,
  ) {}

  get() {
    return this.settingsModel
      .findOneAndUpdate({}, { $setOnInsert: DEFAULTS }, { upsert: true, new: true, sort: { createdAt: 1 } })
      .lean();
  }

  async update(dto: UpdateSettingsDto) {
    const current = await this.get();
    return this.settingsModel.findByIdAndUpdate(current._id, { $set: dto }, { new: true, runValidators: true }).lean();
  }

  async uploadCompanyProfile(file: Express.Multer.File) {
    const current = await this.get();
    const stored = await this.storage.upload(file, 'documents');
    const updated = await this.settingsModel
      .findByIdAndUpdate(
        current._id,
        { $set: { companyProfileUrl: stored.url, companyProfilePath: stored.storagePath } },
        { new: true },
      )
      .lean();
    if (current.companyProfilePath) await this.storage.remove(current.companyProfilePath);
    return updated;
  }

  async removeCompanyProfile() {
    const current = await this.get();
    const updated = await this.settingsModel
      .findByIdAndUpdate(current._id, { $unset: { companyProfileUrl: 1, companyProfilePath: 1 } }, { new: true })
      .lean();
    if (current.companyProfilePath) await this.storage.remove(current.companyProfilePath);
    return updated;
  }
}
