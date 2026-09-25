import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Demand, DemandSchema } from '../demands/demand.schema';
import { Job, JobSchema } from '../jobs/job.schema';
import { News, NewsSchema } from '../news/news.schema';
import { Project, ProjectSchema } from '../projects/project.schema';
import { Tender, TenderSchema } from '../tenders/tender.schema';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: Demand.name, schema: DemandSchema },
      { name: News.name, schema: NewsSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Tender.name, schema: TenderSchema },
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
