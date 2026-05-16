import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import * as argon from 'argon2';
import { Role } from '../shared/entities';
import { BadRequestException, ImATeapotException } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  mockModelFactory,
  MockModel,
} from '../test-utils/mongoose-mock-factory';

jest.mock('argon2');

describe('UserService', () => {
  let service: UserService;
  let userModel: MockModel;
  let feedModel: MockModel;
  let tagModel: MockModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken('User'),
          useValue: mockModelFactory(),
        },
        {
          provide: getModelToken('Feed'),
          useValue: mockModelFactory(),
        },
        {
          provide: getModelToken('Tag'),
          useValue: mockModelFactory(),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get(getModelToken('User'));
    feedModel = module.get(getModelToken('Feed'));
    tagModel = module.get(getModelToken('Tag'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const dto = { login: 'test', password: 'password', role: Role.User };
      (argon.hash as jest.Mock).mockResolvedValue('hashed');
      userModel.findOne!.mockResolvedValue(null);

      const savedUser = {
        ...dto,
        password: 'hashed',
        toObject: jest.fn().mockReturnValue({ login: 'test', role: Role.User }),
      };

      // Mocking the constructor and save
      const saveMock = jest.fn().mockResolvedValue(savedUser);
      userModel.mockImplementation(() => ({
        save: saveMock,
      }));

      const result = await service.create(dto);

      expect(result).toEqual({ login: 'test', role: Role.User });
      expect(argon.hash).toHaveBeenCalledWith('password');
      expect(saveMock).toHaveBeenCalled();
    });

    it('should throw ImATeapotException if user already exists', async () => {
      userModel.findOne!.mockResolvedValue({ id: '1' });
      await expect(
        service.create({ login: 'test', password: 'p', role: Role.User }),
      ).rejects.toThrow(ImATeapotException);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const pagination = { pageNumber: 1, perPage: 10 };
      const mockResult = [
        {
          total: 1,
          result: [{ login: 'user1' }],
        },
      ];
      userModel.aggregate!.mockResolvedValue(mockResult);

      const result = await service.findAll({ pagination });

      expect(result).toEqual(mockResult[0]);
      expect(userModel['aggregate']).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove user and related data', (done) => {
      const userId = new Types.ObjectId();
      userModel.findById!.mockResolvedValue({ _id: userId });
      tagModel.deleteMany!.mockResolvedValue({ deletedCount: 2 });
      feedModel.deleteMany!.mockResolvedValue({ deletedCount: 3 });
      userModel.findByIdAndDelete!.mockResolvedValue({ _id: userId });

      service.remove(userId.toHexString()).subscribe(() => {
        expect(userModel['findById']).toHaveBeenCalled();
        expect(tagModel['deleteMany']).toHaveBeenCalled();
        expect(feedModel['deleteMany']).toHaveBeenCalled();
        expect(userModel['findByIdAndDelete']).toHaveBeenCalled();
        done();
      });
    });

    it('should throw BadRequestException if user not found', (done) => {
      userModel.findById!.mockResolvedValue(null);

      service.remove('invalid').subscribe({
        error: (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          done();
        },
      });
    });
  });
});
