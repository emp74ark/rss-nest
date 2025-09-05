import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedSchema } from '../schemas/feed.schema';
import { SharedModule } from '../shared/shared.module';
import { ArticleModule } from '../article/article.module';

@Module({
  controllers: [FeedController],
  providers: [FeedService],
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Feed',
        schema: FeedSchema,
      },
    ]),
    SharedModule,
    ArticleModule,
  ],
})
export class FeedModule {}
