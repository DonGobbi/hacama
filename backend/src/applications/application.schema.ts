import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Job } from '../jobs/job.schema';

export enum ApplicationStatus {
  New = 'new',
  Reviewing = 'reviewing',
  Shortlisted = 'shortlisted',
  Rejected = 'rejected',
  Hired = 'hired',
}

@Schema({ timestamps: true })
export class Application {
  @Prop({ type: Types.ObjectId, ref: Job.name, required: true, index: true })
  job: Types.ObjectId;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ default: '' })
  coverLetter: string;

  @Prop()
  cvUrl?: string;

  @Prop()
  cvStoragePath?: string;

  @Prop({ type: String, enum: ApplicationStatus, default: ApplicationStatus.New, index: true })
  status: ApplicationStatus;

  @Prop({ default: '' })
  notes: string;
}

export type ApplicationDocument = HydratedDocument<Application>;
export const ApplicationSchema = SchemaFactory.createForClass(Application);
