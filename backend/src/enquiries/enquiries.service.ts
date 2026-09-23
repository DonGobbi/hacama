import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CreateEnquiryDto, EnquiryQueryDto, UpdateEnquiryDto } from './enquiries.dto';
import { Enquiry, EnquiryType } from './enquiry.schema';

@Injectable()
export class EnquiriesService {
  constructor(@InjectModel(Enquiry.name) private readonly enquiryModel: Model<Enquiry>) {}

  async create(dto: CreateEnquiryDto) {
    if (dto.website) return { submitted: true };

    const isQuote = dto.type === EnquiryType.Quote;
    const enquiry = await this.enquiryModel.create({
      type: dto.type,
      name: dto.name,
      organization: dto.organization ?? '',
      email: dto.email,
      phone: dto.phone ?? '',
      category: dto.category ?? '',
      message: dto.message ?? '',
      items: isQuote ? (dto.items ?? []).map((i) => ({ description: i.description, quantity: i.quantity ?? '' })) : [],
      deliveryLocation: isQuote ? (dto.deliveryLocation ?? '') : '',
      neededBy: isQuote ? (dto.neededBy ?? '') : '',
    });
    return { id: enquiry.id, submitted: true };
  }

  findAll(query: EnquiryQueryDto) {
    const filter: FilterQuery<Enquiry> = {};
    if (query.type) filter.type = query.type;
    if (query.status) filter.status = query.status;
    return this.enquiryModel.find(filter).sort({ createdAt: -1 }).lean();
  }

  async update(id: string, dto: UpdateEnquiryDto) {
    const enquiry = await this.enquiryModel.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).lean();
    if (!enquiry) throw new NotFoundException('Enquiry not found');
    return enquiry;
  }

  async remove(id: string) {
    const enquiry = await this.enquiryModel.findByIdAndDelete(id).lean();
    if (!enquiry) throw new NotFoundException('Enquiry not found');
    return { deleted: true };
  }
}
