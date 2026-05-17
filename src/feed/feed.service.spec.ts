import { Test, TestingModule } from '@nestjs/testing';
import { FeedService } from './feed.service';
import { getModelToken } from '@nestjs/mongoose';
import {
  MockModel,
  mockModelFactory,
  mockQueryFactory,
} from '../test-utils/mongoose-mock-factory';
import { ArticleService } from '../article/article.service';
import { FeedParserService } from '../shared/feed-parser.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import mongoose from 'mongoose';
import { CreateFeedDto } from './dto/create-feed.dto';

describe('FeedService', () => {
  let service: FeedService;
  let feedModel: MockModel;
  let articleService: ArticleService;
  let feedParserService: FeedParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedService,
        {
          provide: getModelToken('Feed'),
          useValue: mockModelFactory(),
        },
        {
          provide: ArticleService,
          useValue: {
            addMany: jest.fn(),
            findAllGuidsByFeed: jest.fn(),
            deleteMany: jest.fn(),
          },
        },
        {
          provide: FeedParserService,
          useValue: {
            getNewArticles: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FeedService>(FeedService);
    feedModel = module.get(getModelToken('Feed'));
    articleService = module.get<ArticleService>(ArticleService);
    feedParserService = module.get<FeedParserService>(FeedParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a feed and its articles', async () => {
      const dto = { link: 'http://test.com' };
      const userId = 'user123';
      const mockArticles = [{ guid: '1' }];
      const mockSavedArticles = [{ _id: 'art1' }];

      (feedParserService.getNewArticles as jest.Mock).mockResolvedValue(
        mockArticles,
      );
      (articleService.addMany as jest.Mock).mockResolvedValue(
        mockSavedArticles,
      );
      feedModel.create!.mockResolvedValue({ _id: 'feed1' });

      const result = await service.create({
        createFeedDto: dto as unknown as CreateFeedDto,
        userId,
      });

      expect(result).toBeDefined();
      expect(feedParserService['getNewArticles']).toHaveBeenCalled();
      expect(articleService['addMany']).toHaveBeenCalled();
      expect(feedModel['create']).toHaveBeenCalled();
    });

    it('should throw BadRequestException if userId is missing', async () => {
      await expect(
        service.create({ createFeedDto: {} as unknown as CreateFeedDto }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a feed if found', async () => {
      const mockFeed = { _id: '1' };
      const query = mockQueryFactory();
      query.exec.mockResolvedValue(mockFeed);
      feedModel.findOne!.mockReturnValue(query);

      const result = await service.findOne({ id: '1', userId: 'u' });
      expect(result).toBe(mockFeed);
    });

    it('should throw NotFoundException if feed not found', async () => {
      const query = mockQueryFactory();
      query.exec.mockResolvedValue(null);
      feedModel.findOne!.mockReturnValue(query);

      await expect(service.findOne({ id: '1', userId: 'u' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('refreshOne', () => {
    it('should refresh feed with new articles', async () => {
      const userId = 'u1';
      const feedId = new mongoose.Types.ObjectId().toHexString();
      const mockFeed = {
        _id: new mongoose.Types.ObjectId(feedId),
        link: 'http://test.com',
        settings: { enabled: true },
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockFeed as any);
      (articleService.findAllGuidsByFeed as jest.Mock).mockResolvedValue([
        { guid: 'old' },
      ]);
      (feedParserService.getNewArticles as jest.Mock).mockResolvedValue([
        { guid: 'new', _id: 'new_art_id' },
      ]);
      (articleService.addMany as jest.Mock).mockResolvedValue([
        { _id: 'new_art_id' },
      ]);
      feedModel.findByIdAndUpdate!.mockResolvedValue(mockFeed);

      await service.refreshOne({ userId, feedId });

      expect(articleService['addMany']).toHaveBeenCalled();
      expect(feedModel['findByIdAndUpdate']).toHaveBeenCalled();
    });
  });
});
