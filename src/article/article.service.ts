import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Article } from '../schemas/article.schema';
import { Paginated, Pagination } from '../shared/entities';

@Injectable()
export class ArticleService {
  constructor(@InjectModel('Article') private articleModel: Model<Article>) {}

  create(createArticleDto: CreateArticleDto) {
    return this.articleModel.create(createArticleDto);
  }

  async findAllByUser({
    userId,
    pagination,
    read,
    tags,
  }: {
    userId?: string;
    pagination: Pagination;
    read?: 'true' | 'false';
    tags?: string[];
  }): Promise<Paginated<Article>> {
    const query = {
      userId: userId,
    };

    if (read) {
      query['read'] = read === 'true';
    }

    if (tags?.length) {
      query['tags'] = { $in: tags };
    }

    const result: Paginated<Article>[] = await this.articleModel.aggregate([
      { $match: query },
      {
        $facet: {
          count: [{ $count: 'total' }],
          current: [
            { $skip: (pagination.pageNumber - 1) * pagination.perPage },
            { $limit: pagination.perPage },
          ],
        },
      },
      {
        $project: {
          total: { $ifNull: [{ $arrayElemAt: ['$count.total', 0] }, 0] },
          result: '$current',
        },
      },
    ]);

    if (result.length === 0) {
      return {
        total: 0,
        result: [],
      };
    }

    return result[0];
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

  deleteMany({ subscriptionId }: { subscriptionId?: string }) {
    return this.articleModel.deleteMany({ subscriptionId: subscriptionId });
  }
}
