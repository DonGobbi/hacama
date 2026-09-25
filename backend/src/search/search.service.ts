import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Demand } from '../demands/demand.schema';
import { Job, JobStatus } from '../jobs/job.schema';
import { News } from '../news/news.schema';
import { Project } from '../projects/project.schema';
import { Tender } from '../tenders/tender.schema';

const PER_GROUP = 8;

/** Escape regex metacharacters so the query is treated as literal text. */
const rx = (q: string) => new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Job.name) private readonly jobs: Model<Job>,
    @InjectModel(Demand.name) private readonly demands: Model<Demand>,
    @InjectModel(News.name) private readonly news: Model<News>,
    @InjectModel(Project.name) private readonly projects: Model<Project>,
    @InjectModel(Tender.name) private readonly tenders: Model<Tender>,
  ) {}

  async search(q: string) {
    const query = q.trim();
    if (query.length < 2) return { q: query, jobs: [], demands: [], news: [], projects: [], tenders: [] };

    const pattern = rx(query);
    const [jobs, demands, news, projects, tenders] = await Promise.all([
      this.jobs
        .find(
          { status: JobStatus.Open, $or: [{ title: pattern }, { summary: pattern }, { department: pattern }, { location: pattern }] },
          { title: 1, slug: 1, summary: 1, location: 1, employmentType: 1, deadline: 1 },
        )
        .limit(PER_GROUP)
        .lean(),
      this.demands
        .find({ published: true, $or: [{ title: pattern }, { quantity: pattern }, { location: pattern }] }, { title: 1, slug: 1, quantity: 1, location: 1, status: 1 })
        .limit(PER_GROUP)
        .lean(),
      this.news
        .find({ published: true, $or: [{ title: pattern }, { summary: pattern }, { body: pattern }] }, { title: 1, summary: 1, category: 1, createdAt: 1 })
        .limit(PER_GROUP)
        .lean(),
      this.projects
        .find({ published: true, $or: [{ title: pattern }, { summary: pattern }, { client: pattern }, { category: pattern }] }, { title: 1, slug: 1, summary: 1, category: 1, year: 1 })
        .limit(PER_GROUP)
        .lean(),
      this.tenders
        .find({ published: true, $or: [{ title: pattern }, { reference: pattern }, { summary: pattern }] }, { title: 1, reference: 1, summary: 1, deadline: 1, status: 1, documentUrl: 1 })
        .limit(PER_GROUP)
        .lean(),
    ]);

    return { q: query, jobs, demands, news, projects, tenders };
  }
}
