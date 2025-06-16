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

  async findAll({ userId }: { userId?: string }) {
    return await this.subscriptionModel.find({ userId: userId }).exec();
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
    return this.subscriptionModel.findByIdAndDelete(id).exec();
  }

  async refresh({
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
}
