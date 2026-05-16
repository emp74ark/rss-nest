import { Test, TestingModule } from '@nestjs/testing';
import { TagService } from './tag.service';
import { getModelToken } from '@nestjs/mongoose';
import {
  mockModelFactory,
  MockModel,
} from '../test-utils/mongoose-mock-factory';
import { ConflictException } from '@nestjs/common';

describe('TagService', () => {
  let service: TagService;
  let tagModel: MockModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagService,
        {
          provide: getModelToken('Tag'),
          useValue: mockModelFactory(),
        },
      ],
    }).compile();

    service = module.get<TagService>(TagService);
    tagModel = module.get(getModelToken('Tag'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new tag if it does not exist', async () => {
      tagModel.findOne!.mockResolvedValue(null);
      tagModel.create!.mockResolvedValue({ name: 'newTag' });

      const result = await service.create({
        userId: 'u1',
        createTagDto: { name: 'newTag' },
      });

      expect(result.name).toBe('newTag');
      expect(tagModel['create']).toHaveBeenCalled();
    });

    it('should throw ConflictException if tag already exists', async () => {
      tagModel.findOne!.mockResolvedValue({ name: 'exists' });
      await expect(
        service.create({
          userId: 'u1',
          createTagDto: { name: 'exists' },
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('onModuleInit', () => {
    it('should call createFav', async () => {
      const createFavSpy = jest
        .spyOn(service, 'createFav')
        .mockResolvedValue(undefined);
      await service.onModuleInit();
      expect(createFavSpy).toHaveBeenCalled();
    });
  });
});
