import { Test, TestingModule } from '@nestjs/testing';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { CreateFeedDto } from './dto/create-feed.dto';
import { Pagination } from '../shared/entities';

describe('FeedController', () => {
  let controller: FeedController;
  let service: FeedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedController],
      providers: [
        {
          provide: FeedService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            refreshAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            refreshOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FeedController>(FeedController);
    service = module.get<FeedService>(FeedService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call feedService.create', async () => {
      const dto = { link: 'http://test.com' };
      const userId = 'u1';
      await controller.create(dto as unknown as CreateFeedDto, userId);
      expect(service['create']).toHaveBeenCalledWith({
        createFeedDto: dto,
        userId,
      });
    });
  });

  describe('findAll', () => {
    it('should call feedService.findAll', async () => {
      const userId = 'u1';
      const pagination = { pageNumber: 1, perPage: 10 } as Pagination;
      await controller.findAll(userId, pagination);
      expect(service['findAll']).toHaveBeenCalledWith({
        userId,
        pagination,
      });
    });
  });

  describe('refreshAll', () => {
    it('should call feedService.refreshAll', async () => {
      const userId = 'u1';
      await controller.refreshAll(userId);
      expect(service['refreshAll']).toHaveBeenCalledWith({ userId });
    });
  });
});
