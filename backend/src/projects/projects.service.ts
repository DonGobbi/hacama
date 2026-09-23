import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContentService } from '../common/content.service';
import { StorageService } from '../storage/storage.service';
import { Project } from './project.schema';

@Injectable()
export class ProjectsService extends ContentService<Project> {
  constructor(@InjectModel(Project.name) model: Model<Project>, storage: StorageService) {
    super(model, storage, 'projects', 'Project');
  }
}
