import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { SourceSubscription } from '../schemas/subscription.schema';
import { FeedParserService } from '../shared/feed-parser.service';
import { ArticleService } from '../article/article.service';
import { CreateArticleDto } from '../article/dto/create-article.dto';
import { Paginated, Pagination } from '../shared/entities';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel('Subscription')
    private subscriptionModel: Model<SourceSubscription>,
    private articleService: ArticleService,
    private feedParserService: FeedParserService,
  ) {}

  async create({
    createSubscriptionDto,
    userId,
  }: {
    createSubscriptionDto: CreateSubscriptionDto;
    userId?: string;
  }) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    const articles = await this.feedParserService.getNewArticles({
      link: createSubscriptionDto.link,
      guids: [],
    });
    const subscriptionId = new mongoose.Types.ObjectId();
    const savedArticles = await this.articleService.addMany({
      userId,
      subscriptionId: subscriptionId.toHexString(),
      articles: articles as CreateArticleDto[],
    });
    const articleIds = savedArticles.map(({ _id }) => _id);
    return this.subscriptionModel.create({
      _id: subscriptionId,
      ...createSubscriptionDto,
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
  }): Promise<Paginated<SourceSubscription>> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const result: Paginated<SourceSubscription>[] =
      await this.subscriptionModel.aggregate([
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
    const subscription = await this.subscriptionModel
      .findOne({ _id: id })
      .exec();
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
    return subscription;
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    const subscription = await this.subscriptionModel
      .findByIdAndUpdate(id, updateSubscriptionDto, { new: true })
      .exec();
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
    return subscription;
  }

  async remove(id: string) {
    await this.articleService.deleteMany({ subscriptionId: id });
    return this.subscriptionModel.findByIdAndDelete(id).exec();
  }

  async refreshOne({
    userId,
    subscriptionId,
  }: {
    userId?: string;
    subscriptionId: string;
  }) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const subscription = await this.findOne(subscriptionId);
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const existingArticles = await this.articleService.findAllBySubscription({
      userId,
      subscriptionId,
    });

    const guids = existingArticles.map(({ guid }) => guid);

    const newArticles = await this.feedParserService.getNewArticles({
      link: subscription.link,
      guids,
    });

    if (newArticles?.length) {
      const savedNewArticle = await this.articleService.addMany({
        userId,
        subscriptionId,
        articles: newArticles as CreateArticleDto[],
      });

      const articleIds = savedNewArticle.map(({ _id }) => _id);

      return this.subscriptionModel.findByIdAndUpdate(subscriptionId, {
        $push: {
          articles: articleIds,
        },
      });
    } else {
      return subscription;
    }
  }

  async refreshAll({ userId }: { userId: string }) {
    const subscriptions = await this.subscriptionModel.find({ userId });

    const promises = subscriptions.map((s) => {
      return this.refreshOne({ userId, subscriptionId: s._id.toHexString() });
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
