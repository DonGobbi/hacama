import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Partner {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '', trim: true })
  website: string;

  @Prop()
  imageUrl?: string;

  @Prop()
  imagePath?: string;

  @Prop({ default: true, index: true })
  published: boolean;

  @Prop({ default: 0 })
  order: number;
}

export type PartnerDocument = HydratedDocument<Partner>;
export const PartnerSchema = SchemaFactory.createForClass(Partner);
