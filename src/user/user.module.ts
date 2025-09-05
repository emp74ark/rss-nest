import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../schemas/user.schema';
import { UserCronService } from './user-cron.service';
import { FeedSchema } from '../schemas/feed.schema';
import { TagSchema } from '../schemas/tags.schema';
import { ArticleSchema } from '../schemas/article.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Feed', schema: FeedSchema },
      { name: 'Tag', schema: TagSchema },
      { name: 'Article', schema: ArticleSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, UserCronService],
})
export class UserModule {}
