import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Subscriber {
  @Prop({ required: true, lowercase: true, trim: true, unique: true, index: true })
  email: string;
}

export type SubscriberDocument = HydratedDocument<Subscriber>;
export const SubscriberSchema = SchemaFactory.createForClass(Subscriber);
