import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { ContentService } from '../common/content.service';
import { StorageService } from '../storage/storage.service';
import { Project } from './project.schema';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';

export function slugifyProject(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

@Injectable()
export class ProjectsService extends ContentService<Project> {
  constructor(@InjectModel(Project.name) model: Model<Project>, storage: StorageService) {
    super(model, storage, 'projects', 'Project');
  }

  /**
   * Finds a published project by slug. Projects created before slugs existed
   * match by their slugified title so old cards still resolve.
   */
  async findPublicBySlug(slug: string) {
    const direct = await this.model.findOne({ slug, published: true }).lean();
    if (direct) return direct;
    const candidates = await this.model.find({ published: true }).lean();
    const project = candidates.find((p) => slugifyProject(p.title) === slug);
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  override create(dto: CreateProjectDto, file?: Express.Multer.File) {
    const slug = `${slugifyProject(dto.title)}-${randomBytes(3).toString('hex')}`;
    return super.create({ ...dto, slug }, file);
  }

  /** Backfill a slug on update for projects created before slugs existed. */
  override async update(id: string, dto: UpdateProjectDto, file?: Express.Multer.File) {
    const current = await this.model.findById(id).lean();
    if (!current) throw new NotFoundException('Project not found');
    if (!current.slug) {
      dto.slug = `${slugifyProject(dto.title ?? current.title)}-${randomBytes(3).toString('hex')}`;
    }
    return super.update(id, dto, file);
  }
}
