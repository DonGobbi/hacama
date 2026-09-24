import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityModule } from './activity/activity.module';
import { ApplicationsModule } from './applications/applications.module';
import { AuthModule } from './auth/auth.module';
import { DemandsModule } from './demands/demands.module';
import { EnquiriesModule } from './enquiries/enquiries.module';
import { HealthController } from './health.controller';
import { JobsModule } from './jobs/jobs.module';
import { MailModule } from './mail/mail.module';
import { NewsModule } from './news/news.module';
import { PartnersModule } from './partners/partners.module';
import { PhotosModule } from './photos/photos.module';
import { ProjectsModule } from './projects/projects.module';
import { SettingsModule } from './settings/settings.module';
import { StorageModule } from './storage/storage.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI', 'mongodb://localhost:27017/hacama'),
      }),
    }),
    StorageModule,
    MailModule,
    UsersModule,
    ActivityModule,
    AuthModule,
    JobsModule,
    NewsModule,
    DemandsModule,
    ApplicationsModule,
    PhotosModule,
    EnquiriesModule,
    TestimonialsModule,
    PartnersModule,
    ProjectsModule,
    SettingsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
