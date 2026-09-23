import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum EnquiryType {
  Contact = 'contact',
  Quote = 'quote',
}

export enum EnquiryStatus {
  New = 'new',
  InProgress = 'in-progress',
  Quoted = 'quoted',
  Closed = 'closed',
}

@Schema({ _id: false })
export class EnquiryItem {
  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ default: '', trim: true })
  quantity: string;
}

export const EnquiryItemSchema = SchemaFactory.createForClass(EnquiryItem);

@Schema({ timestamps: true })
export class Enquiry {
  @Prop({ type: String, enum: EnquiryType, required: true, index: true })
  type: EnquiryType;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '', trim: true })
  organization: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ default: '', trim: true })
  phone: string;

  @Prop({ default: '', trim: true })
  category: string;

  @Prop({ default: '' })
  message: string;

  @Prop({ type: [EnquiryItemSchema], default: [] })
  items: EnquiryItem[];

  @Prop({ default: '', trim: true })
  deliveryLocation: string;

  @Prop({ default: '', trim: true })
  neededBy: string;

  @Prop({ type: String, enum: EnquiryStatus, default: EnquiryStatus.New, index: true })
  status: EnquiryStatus;

  @Prop({ default: '' })
  notes: string;
}

export type EnquiryDocument = HydratedDocument<Enquiry>;
export const EnquirySchema = SchemaFactory.createForClass(Enquiry);
