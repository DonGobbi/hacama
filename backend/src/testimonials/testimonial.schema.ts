import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Testimonial {
  @Prop({ required: true, trim: true })
  quote: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '', trim: true })
  role: string;

  @Prop({ default: '', trim: true })
  organization: string;

  @Prop()
  imageUrl?: string;

  @Prop()
  imagePath?: string;

  @Prop({ default: true, index: true })
  published: boolean;

  @Prop({ default: 0 })
  order: number;
}

export type TestimonialDocument = HydratedDocument<Testimonial>;
export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);
