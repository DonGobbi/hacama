import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SupplierStatus = 'new' | 'contacted' | 'approved' | 'rejected';

@Schema({ timestamps: true })
export class Supplier {
  @Prop({ required: true, trim: true })
  companyName: string;

  @Prop({ required: true, trim: true })
  contactPerson: string;

  @Prop({ required: true, trim: true, lowercase: true, index: true })
  email: string;

  @Prop({ default: '', trim: true })
  phone: string;

  @Prop({ default: '', trim: true })
  location: string;

  @Prop({ type: [String], default: [] })
  categories: string[];

  @Prop({ default: '' })
  notes: string;

  @Prop({ default: 'new', enum: ['new', 'contacted', 'approved', 'rejected'], index: true })
  status: SupplierStatus;
}

export type SupplierDocument = HydratedDocument<Supplier>;
export const SupplierSchema = SchemaFactory.createForClass(Supplier);
