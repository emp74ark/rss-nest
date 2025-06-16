import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionSchema } from '../schemas/subscription.schema';
import { SharedModule } from '../shared/shared.module';
import { ArticleModule } from '../article/article.module';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Subscription',
        schema: SubscriptionSchema,
      },
    ]),
    SharedModule,
    ArticleModule,
  ],
})
export class SubscriptionModule {}
