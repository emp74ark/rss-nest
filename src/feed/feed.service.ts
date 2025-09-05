import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { SourceFeed } from '../schemas/feed.schema';
import { FeedParserService } from '../shared/feed-parser.service';
import { ArticleService } from '../article/article.service';
import { CreateArticleDto } from '../article/dto/create-article.dto';
import { Paginated, Pagination } from '../shared/entities';

@Injectable()
export class FeedService {
  constructor(
    @InjectModel('Feed')
    private feedModel: Model<SourceFeed>,
    private articleService: ArticleService,
    private feedParserService: FeedParserService,
  ) {}

  async create({
    createFeedDto,
    userId,
  }: {
    createFeedDto: CreateFeedDto;
    userId?: string;
  }) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    const articles = await this.feedParserService.getNewArticles({
      link: createFeedDto.link,
      guids: [],
    });
    const feedId = new mongoose.Types.ObjectId();
    const savedArticles = await this.articleService.addMany({
      userId,
      feedId: feedId.toHexString(),
      articles: articles as CreateArticleDto[],
    });
    const articleIds = savedArticles.map(({ _id }) => _id);
    return this.feedModel.create({
      _id: feedId,
      ...createFeedDto,
      userId: userId,
      articles: articleIds,
    });
  }

  async findAll({
    userId,
    pagination,
  }: {
    userId?: string;
    pagination: Pagination;
  }): Promise<Paginated<SourceFeed>> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const result: Paginated<SourceFeed>[] = await this.feedModel.aggregate([
      { $match: { userId: userObjectId } },
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

  async findOne(id: string) {
    const feed = await this.feedModel.findOne({ _id: id }).exec();
    if (!feed) {
      throw new NotFoundException('Feed not found');
    }
    return feed;
  }

  async update(id: string, updateFeedDto: UpdateFeedDto) {
    const feed = await this.feedModel
      .findByIdAndUpdate(id, updateFeedDto, { new: true })
      .exec();
    if (!feed) {
      throw new NotFoundException('Feed not found');
    }
    return feed;
  }

  async remove(id: string) {
    await this.articleService.deleteMany({ feedId: id });
    return this.feedModel.findByIdAndDelete(id).exec();
  }

  async refreshOne({ userId, feedId }: { userId?: string; feedId: string }) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const feed = await this.findOne(feedId);
    if (!feed) {
      throw new NotFoundException('Feed not found');
    }

    const existingArticles = await this.articleService.findAllByFeed({
      userId,
      feedId: feedId,
    });

    const guids = existingArticles.map(({ guid }) => guid);

    const newArticles = await this.feedParserService.getNewArticles({
      link: feed.link,
      guids,
    });

    if (newArticles?.length) {
      const savedNewArticle = await this.articleService.addMany({
        userId,
        feedId,
        articles: newArticles as CreateArticleDto[],
      });

      const articleIds = savedNewArticle.map(({ _id }) => _id);

      return this.feedModel.findByIdAndUpdate(feedId, {
        $push: {
          articles: articleIds,
        },
      });
    } else {
      return feed;
    }
  }

  async refreshAll({ userId }: { userId: string }) {
    const feeds = await this.feedModel.find({ userId });

    const promises = feeds.map((s) => {
      return this.refreshOne({ userId, feedId: s._id.toHexString() });
    });

    const result = await Promise.allSettled(promises);

    return result
      .map((r) => {
        if (r.status === 'fulfilled') {
          return r.value;
        }
      })
      .filter(Boolean);
  }
}
