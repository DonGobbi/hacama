import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class SiteVisit {
  @Prop({ default: '', trim: true })
  ip: string;

  @Prop({ default: '', trim: true })
  device: string;

  @Prop({ default: '', trim: true })
  location: string;

  @Prop({ default: '/', trim: true })
  path: string;
}

export type SiteVisitDocument = HydratedDocument<SiteVisit>;
export const SiteVisitSchema = SchemaFactory.createForClass(SiteVisit);
