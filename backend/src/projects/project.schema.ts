import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ unique: true, sparse: true, index: true })
  slug?: string;

  @Prop({ default: '', trim: true })
  client: string;

  @Prop({ default: '', trim: true })
  category: string;

  @Prop({ default: '', trim: true })
  year: string;

  @Prop({ default: '' })
  summary: string;

  @Prop({ default: '' })
  details: string;

  @Prop()
  imageUrl?: string;

  @Prop()
  imagePath?: string;

  @Prop({ default: true, index: true })
  published: boolean;

  @Prop({ default: 0 })
  order: number;
}

export type ProjectDocument = HydratedDocument<Project>;
export const ProjectSchema = SchemaFactory.createForClass(Project);
