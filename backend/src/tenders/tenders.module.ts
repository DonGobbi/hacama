import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tender, TenderSchema } from './tender.schema';
import { TendersController } from './tenders.controller';
import { TendersService } from './tenders.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Tender.name, schema: TenderSchema }])],
  controllers: [TendersController],
  providers: [TendersService],
})
export class TendersModule {}
