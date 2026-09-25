import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TenderStatus = 'open' | 'closed';

@Schema({ timestamps: true })
export class Tender {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '', trim: true })
  reference: string;

  @Prop({ default: '', trim: true })
  summary: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: Date })
  deadline?: Date;

  @Prop({ default: 'open', enum: ['open', 'closed'], index: true })
  status: TenderStatus;

  @Prop()
  documentUrl?: string;

  @Prop()
  documentPath?: string;

  @Prop({ default: true, index: true })
  published: boolean;
}

export type TenderDocument = HydratedDocument<Tender>;
export const TenderSchema = SchemaFactory.createForClass(Tender);
