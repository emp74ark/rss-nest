import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticleSchema } from '../schemas/article.schema';

@Module({
  controllers: [ArticleController],
  providers: [ArticleService],
  imports: [
    MongooseModule.forFeature([{ name: 'Article', schema: ArticleSchema }]),
  ],
  exports: [ArticleService],
})
export class ArticleModule {}
