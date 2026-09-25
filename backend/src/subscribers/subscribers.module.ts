import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Subscriber, SubscriberSchema } from './subscriber.schema';
import { SubscribersController } from './subscribers.controller';
import { SubscribersService } from './subscribers.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Subscriber.name, schema: SubscriberSchema }])],
  controllers: [SubscribersController],
  providers: [SubscribersService],
})
export class SubscribersModule {}
