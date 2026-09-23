import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { JobsService } from '../jobs/jobs.service';
import { StorageService } from '../storage/storage.service';
import { Application } from './application.schema';
import { ApplicationQueryDto, CreateApplicationDto, UpdateApplicationDto } from './applications.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application.name) private readonly applicationModel: Model<Application>,
    private readonly jobsService: JobsService,
    private readonly storage: StorageService,
  ) {}

  async create(dto: CreateApplicationDto, cv?: Express.Multer.File) {
    const job = await this.jobsService.findById(dto.jobId);
    if (job.status !== 'open') throw new NotFoundException('This job is no longer accepting applications');

    const stored = cv ? await this.storage.upload(cv, 'applications') : undefined;

    const application = await this.applicationModel.create({
      job: new Types.ObjectId(dto.jobId),
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      coverLetter: dto.coverLetter ?? '',
      cvUrl: stored?.url,
      cvStoragePath: stored?.storagePath,
    });
    return { id: application.id, submitted: true };
  }

  findAll(query: ApplicationQueryDto) {
    const filter: FilterQuery<Application> = {};
    if (query.jobId) filter.job = new Types.ObjectId(query.jobId);
    if (query.status) filter.status = query.status;
    return this.applicationModel
      .find(filter)
      .populate('job', 'title slug location')
      .sort({ createdAt: -1 })
      .lean();
  }

  async update(id: string, dto: UpdateApplicationDto) {
    const application = await this.applicationModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .populate('job', 'title slug location')
      .lean();
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  async remove(id: string) {
    const application = await this.applicationModel.findByIdAndDelete(id).lean();
    if (!application) throw new NotFoundException('Application not found');
    if (application.cvStoragePath) await this.storage.remove(application.cvStoragePath);
    return { deleted: true };
  }
}
