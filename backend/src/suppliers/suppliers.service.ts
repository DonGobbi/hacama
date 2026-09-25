import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MailService } from '../mail/mail.service';
import { Supplier } from './supplier.schema';
import { CreateSupplierDto, UpdateSupplierDto } from './suppliers.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectModel(Supplier.name) private readonly model: Model<Supplier>,
    private readonly mail: MailService,
  ) {}

  async register(dto: CreateSupplierDto) {
    // Honeypot filled: pretend success and drop the submission.
    if (dto.website) return { registered: true };
    delete dto.website;

    await this.model.create(dto);
    this.mail.notifyAdmin(
      `New supplier registration: ${dto.companyName}`,
      `<p><strong>${dto.contactPerson}</strong> (${dto.email}) registered as a supplier.</p>` +
        `<p>Categories: ${(dto.categories ?? []).join(', ') || 'none selected'}</p>` +
        `${dto.location ? `<p>Location: ${dto.location}</p>` : ''}` +
        `${dto.phone ? `<p>Phone: ${dto.phone}</p>` : ''}` +
        `${dto.notes ? `<p>Notes:<br>${dto.notes.replace(/\n/g, '<br>')}</p>` : ''}`,
    );
    return { registered: true };
  }

  findAll() {
    return this.model.find().sort({ createdAt: -1 }).lean();
  }

  update(id: string, dto: UpdateSupplierDto) {
    return this.model.findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true }).lean();
  }

  async remove(id: string) {
    const supplier = await this.model.findByIdAndDelete(id).lean();
    if (!supplier) throw new NotFoundException('Supplier not found');
    return { deleted: true };
  }
}
