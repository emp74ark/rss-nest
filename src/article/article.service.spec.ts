import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from './article.service';
import { getModelToken } from '@nestjs/mongoose';
import {
  mockModelFactory,
  MockModel,
} from '../test-utils/mongoose-mock-factory';

import { CrawlerService } from '../shared/crawler.service';
import { of, lastValueFrom } from 'rxjs';
import { SortOrder } from '../shared/entities';
import { CreateArticleDto } from './dto/create-article.dto';
describe('ArticleService', () => {
  let service: ArticleService;
  let articleModel: MockModel;
  let crawlerService: CrawlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: getModelToken('Article'),
          useValue: mockModelFactory(),
        },
        {
          provide: CrawlerService,
          useValue: {
            getDocument: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
    articleModel = module.get(getModelToken('Article'));
    crawlerService = module.get<CrawlerService>(CrawlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllByUser', () => {
    it('should return paginated articles', async () => {
      const mockResult = [{ total: 1, result: [{ title: 'A' }] }];
      articleModel.aggregate!.mockResolvedValue(mockResult);

      const result = await service.findAllByUser({
        userId: 'u1',
        pagination: { pageNumber: 1, perPage: 10 },
        filter: {},
        sort: { date: SortOrder.Desc },
      });

      expect(result).toEqual(mockResult[0]);
    });
  });

  describe('addMany', () => {
    it('should insert multiple articles', async () => {
      const articles = [{ title: 'A' }, { title: 'B' }];
      articleModel.insertMany!.mockResolvedValue(articles);

      const result = await service.addMany({
        userId: 'u1',
        feedId: 'f1',
        articles: articles as unknown as CreateArticleDto[],
      });

      expect(result).toEqual(articles);
      expect(articleModel['insertMany']).toHaveBeenCalled();
    });
  });

  describe('getFullText', () => {
    it('should fetch full text and update article', async () => {
      const mockArticle = { _id: '1', link: 'http://test.com' };
      articleModel.findOne!.mockResolvedValue(mockArticle);
      (crawlerService.getDocument as jest.Mock).mockReturnValue(
        of({ content: 'Full Text', error: false }),
      );
      articleModel.updateOne!.mockResolvedValue({});

      const result = await lastValueFrom(
        await service.getFullText({ id: '1', userId: 'u1' }),
      );
      expect(result.fullText).toBe('Full Text');
      expect(articleModel['updateOne']).toHaveBeenCalled();
    });
  });
});
