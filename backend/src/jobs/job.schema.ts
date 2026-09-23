import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum JobStatus {
  Draft = 'draft',
  Open = 'open',
  Closed = 'closed',
}

export enum EmploymentType {
  FullTime = 'full-time',
  PartTime = 'part-time',
  Contract = 'contract',
  Internship = 'internship',
  Temporary = 'temporary',
}

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ trim: true, default: '' })
  department: string;

  @Prop({ required: true, trim: true })
  location: string;

  @Prop({ type: String, enum: EmploymentType, default: EmploymentType.FullTime })
  employmentType: EmploymentType;

  @Prop({ required: true, trim: true })
  summary: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  responsibilities: string[];

  @Prop({ type: [String], default: [] })
  requirements: string[];

  @Prop({ trim: true, default: '' })
  salary: string;

  @Prop({ type: Date })
  deadline?: Date;

  @Prop({ type: String, enum: JobStatus, default: JobStatus.Draft, index: true })
  status: JobStatus;
}

export type JobDocument = HydratedDocument<Job>;
export const JobSchema = SchemaFactory.createForClass(Job);
