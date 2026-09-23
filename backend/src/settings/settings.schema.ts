import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class Stat {
  @Prop({ required: true, trim: true })
  value: string;

  @Prop({ required: true, trim: true })
  label: string;
}

@Schema({ _id: false })
export class Credential {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '', trim: true })
  detail: string;
}

@Schema({ _id: false })
export class Faq {
  @Prop({ required: true, trim: true })
  question: string;

  @Prop({ required: true, trim: true })
  answer: string;
}

@Schema({ timestamps: true, collection: 'settings' })
export class Settings {
  @Prop({ default: '', trim: true })
  phone: string;

  @Prop({ default: '', trim: true })
  whatsapp: string;

  @Prop({ default: '', trim: true })
  email: string;

  @Prop({ default: '', trim: true })
  address: string;

  @Prop({ default: '', trim: true })
  officeHours: string;

  @Prop({ type: [SchemaFactory.createForClass(Stat)], default: [] })
  stats: Stat[];

  @Prop({ type: [SchemaFactory.createForClass(Credential)], default: [] })
  credentials: Credential[];

  @Prop({ type: [SchemaFactory.createForClass(Faq)], default: [] })
  faqs: Faq[];

  @Prop()
  companyProfileUrl?: string;

  @Prop()
  companyProfilePath?: string;
}

export type SettingsDocument = HydratedDocument<Settings>;
export const SettingsSchema = SchemaFactory.createForClass(Settings);
