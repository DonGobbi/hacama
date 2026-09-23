import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Photo {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '' })
  caption: string;

  @Prop({ trim: true, default: 'General', index: true })
  category: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  storagePath: string;

  @Prop({ required: true })
  contentType: string;

  @Prop({ required: true })
  size: number;

  @Prop({ default: false })
  featured: boolean;
}

export type PhotoDocument = HydratedDocument<Photo>;
export const PhotoSchema = SchemaFactory.createForClass(Photo);
