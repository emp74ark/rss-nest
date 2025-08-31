import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Article } from '../schemas/article.schema';
import { Paginated, Pagination, SortOrder } from '../shared/entities';
import puppeteer from 'puppeteer';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

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
    sort,
  }: {
    userId?: string;
    pagination: Pagination;
    read?: 'true' | 'false';
    tags?: string[];
    sort: {
      date: SortOrder;
    };
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

  updateOne(id: string, updateArticleDto: UpdateArticleDto) {
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

  updateMany({ ids, article }: { ids: string[]; article: UpdateArticleDto }) {
    return this.articleModel.updateMany(
      {
        _id: { $in: ids },
      },
      article,
    );
  }

  updateAll({ article }: { article: UpdateArticleDto }) {
    return this.articleModel.updateMany({}, article);
  }

  deleteMany({ subscriptionId }: { subscriptionId?: string }) {
    return this.articleModel.deleteMany({ subscriptionId: subscriptionId });
  }

  async getFullText({ id }: { id: string }) {
    const article = await this.articleModel.findById(id);

    if (!article) {
      throw new NotFoundException('Article does not exist');
    }

    const link = article.link;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(link, {
      waitUntil: 'domcontentloaded',
    });

    const bodyHtml: string = await page.evaluate(() => document.body.innerHTML);
    const document: Document = new JSDOM(bodyHtml).window.document;
    const read = new Readability(document).parse();
    await browser.close();

    if (!read?.content) {
      throw new NotFoundException('Could not fetch article content');
    }

    await this.articleModel.updateOne(
      { _id: article._id },
      { $set: { fullText: read.content } },
    );

    return { fullText: read?.content };
  }
}
