import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { FilterQuery, Model } from 'mongoose';
import { Job, JobStatus } from './job.schema';
import { CreateJobDto, JobQueryDto, UpdateJobDto } from './jobs.dto';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class JobsService {
  constructor(@InjectModel(Job.name) private readonly jobModel: Model<Job>) {}

  private buildFilter(query: JobQueryDto): FilterQuery<Job> {
    const filter: FilterQuery<Job> = {};
    if (query.status) filter.status = query.status;
    if (query.employmentType) filter.employmentType = query.employmentType;
    if (query.search) {
      const rx = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ title: rx }, { department: rx }, { location: rx }, { summary: rx }];
    }
    return filter;
  }

  findPublic(query: JobQueryDto) {
    return this.jobModel
      .find({ ...this.buildFilter(query), status: JobStatus.Open })
      .sort({ createdAt: -1 })
      .lean();
  }

  findAll(query: JobQueryDto) {
    return this.jobModel.find(this.buildFilter(query)).sort({ createdAt: -1 }).lean();
  }

  async findPublicBySlug(slug: string) {
    const job = await this.jobModel.findOne({ slug, status: JobStatus.Open }).lean();
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async findById(id: string) {
    const job = await this.jobModel.findById(id).lean();
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  create(dto: CreateJobDto) {
    const slug = `${slugify(dto.title)}-${randomBytes(3).toString('hex')}`;
    return this.jobModel.create({ ...dto, slug });
  }

  async update(id: string, dto: UpdateJobDto) {
    const job = await this.jobModel.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).lean();
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async remove(id: string) {
    const job = await this.jobModel.findByIdAndDelete(id).lean();
    if (!job) throw new NotFoundException('Job not found');
    return { deleted: true };
  }

  count(filter: FilterQuery<Job> = {}) {
    return this.jobModel.countDocuments(filter);
  }
}
