import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DemandStatus = 'open' | 'fulfilled';

@Schema({ timestamps: true })
export class Demand {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true, trim: true })
  quantity: string;

  @Prop({ default: '', trim: true })
  price: string;

  @Prop({ default: '', trim: true })
  location: string;

  @Prop({ default: '' })
  details: string;

  @Prop({ default: '', trim: true })
  contact: string;

  @Prop({ default: 'open', enum: ['open', 'fulfilled'], index: true })
  status: DemandStatus;

  @Prop()
  imageUrl?: string;

  @Prop()
  imagePath?: string;

  @Prop({ default: true, index: true })
  published: boolean;

  @Prop({ default: 0 })
  order: number;
}

export type DemandDocument = HydratedDocument<Demand>;
export const DemandSchema = SchemaFactory.createForClass(Demand);
