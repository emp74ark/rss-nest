import {
  ImATeapotException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Article } from '../schemas/article.schema';
import { Paginated, Pagination, SortOrder } from '../shared/entities';
import { CrawlerService } from '../shared/crawler.service';
import { from, map, switchMap } from 'rxjs';

@Injectable()
export class ArticleService {
  constructor(
    @InjectModel('Article') private articleModel: Model<Article>,
    private readonly crawlerService: CrawlerService,
  ) {}

  create(createArticleDto: CreateArticleDto) {
    return this.articleModel.create(createArticleDto);
  }

  async findAllByUser({
    userId,
    pagination,
    filter,
    sort,
  }: {
    userId?: string;
    pagination: Pagination;
    filter: {
      read?: 'true' | 'false';
      tags?: string[];
      feed?: string;
    };
    sort: {
      date: SortOrder;
    };
  }): Promise<Paginated<Article>> {
    const query = {
      userId: userId,
    };

    if (filter.read) {
      query['read'] = filter.read === 'true';
    }

    if (filter.tags?.length) {
      query['tags'] = { $in: filter.tags };
    }

    if (filter.feed) {
      query['feedId'] = filter.feed;
    }

    const result: Paginated<Article>[] = await this.articleModel.aggregate([
      { $match: query },
      {
        $facet: {
          count: [{ $count: 'total' }],
          current: [
            { $sort: { isoDate: sort.date === SortOrder.Asc ? 1 : -1 } },
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

  findAllByFeed({ userId, feedId }: { userId: string; feedId: string }) {
    return this.articleModel
      .find({
        userId,
        feedId,
      })
      .exec();
  }

  findOne({ id, userId }: { id: string; userId: string }) {
    return this.articleModel.findOne({ _id: id, userId });
  }

  updateOne({
    id,
    userId,
    updateArticleDto,
  }: {
    id: string;
    updateArticleDto: UpdateArticleDto;
    userId: string;
  }) {
    return this.articleModel.findOneAndUpdate(
      {
        _id: id,
        userId,
      },
      updateArticleDto,
      {
        new: true,
      },
    );
  }

  remove({ id, userId }: { id: string; userId: string }) {
    return this.articleModel.findOneAndDelete({ _id: id, userId });
  }

  addMany({
    userId,
    feedId,
    articles,
  }: {
    userId: string | mongoose.Types.ObjectId;
    feedId: string | mongoose.Types.ObjectId;
    articles: CreateArticleDto[];
  }) {
    articles.forEach((article) => {
      Reflect.set(article, 'userId', userId);
      Reflect.set(article, 'feedId', feedId);
    });
    return this.articleModel.insertMany(articles);
  }

  updateMany({
    ids,
    article,
    userId,
  }: {
    ids: string[];
    article: UpdateArticleDto;
    userId: string;
  }) {
    return this.articleModel.updateMany(
      {
        _id: { $in: ids },
        userId,
      },
      article,
    );
  }

  updateAll({
    article,
    userId,
  }: {
    article: UpdateArticleDto;
    userId: string;
  }) {
    return this.articleModel.updateMany({ userId }, article);
  }

  deleteMany({ feedId, userId }: { feedId: string; userId: string }) {
    return this.articleModel.deleteMany({ feedId, userId });
  }

  async getFullText({ id, userId }: { id: string; userId: string }) {
    const article = await this.articleModel.findOne({ _id: id, userId });

    if (!article) {
      throw new NotFoundException('Article does not exist');
    }

    const url = article.link;

    return this.crawlerService.getDocument({ url }).pipe(
      map(({ error, content: fullText, errorMessage }) => {
        if (error) {
          switch (errorMessage) {
            case 'captcha':
              throw new NotFoundException(
                'Could not fetch article content. Probably due to the captcha',
              );
            case 'timeout':
              throw new ImATeapotException(
                'Process took too much time and was terminated. Try again later',
              );
            default:
              throw new NotFoundException('Could not fetch article content');
          }
        }
        return fullText;
      }),
      switchMap((fullText) => {
        return from(
          this.articleModel.updateOne(
            { _id: article._id },
            { $set: { fullText } },
          ),
        ).pipe(map(() => ({ fullText })));
      }),
    );
  }
}
