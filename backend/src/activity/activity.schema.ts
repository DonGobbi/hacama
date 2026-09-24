import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { UserRole } from '../users/user.schema';

@Schema({ timestamps: true })
export class ActivityLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  email: string;

  @Prop({ type: String, enum: UserRole, required: true })
  role: UserRole;

  @Prop({ required: true, trim: true })
  action: string;

  @Prop({ default: '', trim: true })
  ip: string;

  @Prop({ default: '', trim: true })
  device: string;

  @Prop({ default: '', trim: true })
  location: string;
}

export type ActivityLogDocument = HydratedDocument<ActivityLog>;
export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
