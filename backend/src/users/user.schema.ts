import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum UserRole {
  SuperAdmin = 'superadmin',
  Admin = 'admin',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ default: '', trim: true })
  phone: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ select: false })
  resetTokenHash?: string;

  @Prop({ select: false })
  resetTokenExpires?: Date;

  @Prop({ type: String, enum: UserRole, default: UserRole.Admin })
  role: UserRole;

  @Prop({ default: true })
  active: boolean;

  @Prop()
  lastLoginAt?: Date;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
