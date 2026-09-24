import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Demand, DemandSchema } from './demand.schema';
import { DemandsController } from './demands.controller';
import { DemandsService } from './demands.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Demand.name, schema: DemandSchema }])],
  controllers: [DemandsController],
  providers: [DemandsService],
})
export class DemandsModule {}
