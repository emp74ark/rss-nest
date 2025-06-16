import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Article } from '../schemas/article.schema';

@Injectable()
export class ArticleService {
  constructor(@InjectModel('Article') private articleModel: Model<Article>) {}

  create(createArticleDto: CreateArticleDto) {
    return this.articleModel.create(createArticleDto);
  }

  findAllByUser({ userId }: { userId?: string }) {
    return this.articleModel.find({ userId: userId }).exec();
  }

  findAllBySubscription({
    userId,
    subscriptionId,
  }: {
    userId: string;
    subscriptionId: string;
  }) {
    return this.articleModel
      .find({
        userId: userId,
        subscriptionId: subscriptionId,
      })
      .exec();
  }

  findOne(id: string) {
    return this.articleModel.findById(id);
  }

  update(id: string, updateArticleDto: UpdateArticleDto) {
    return this.articleModel.findByIdAndUpdate(id, updateArticleDto, {
      new: true,
    });
  }

  remove(id: string) {
    return this.articleModel.findByIdAndDelete(id);
  }

  addMany({
    userId,
    subscriptionId,
    articles,
  }: {
    userId: string | mongoose.Types.ObjectId;
    subscriptionId: string | mongoose.Types.ObjectId;
    articles: CreateArticleDto[];
  }) {
    articles.forEach((article) => {
      Reflect.set(article, 'userId', userId);
      Reflect.set(article, 'subscriptionId', subscriptionId);
    });
    return this.articleModel.insertMany(articles);
  }
}
