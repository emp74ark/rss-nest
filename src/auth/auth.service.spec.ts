import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import {
  MockModel,
  mockModelFactory,
  mockQueryFactory,
} from '../test-utils/mongoose-mock-factory';
import * as argon from 'argon2';
import { ImATeapotException } from '@nestjs/common';

jest.mock('argon2');
jest.mock('unique-username-generator', () => ({
  generateUsername: jest.fn().mockReturnValue('generated_user'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userModel: MockModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken('User'),
          useValue: mockModelFactory(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get(getModelToken('User'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return user if credentials are correct', async () => {
      const dto = { login: 'test', password: 'password' };
      const mockUser = { _id: '1', password: 'hashed' };
      const query = mockQueryFactory();
      query.select.mockReturnThis();
      query.exec.mockResolvedValue(mockUser);
      userModel.findOne!.mockReturnValue(query);
      (argon.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.login(dto);

      expect(result).toBe(mockUser);
      expect(userModel['findByIdAndUpdate']).toHaveBeenCalled();
    });

    it('should return null if user not found', async () => {
      const query = mockQueryFactory();
      query.exec.mockResolvedValue(null);
      userModel.findOne!.mockReturnValue(query);

      const result = await service.login({ login: 'u', password: 'p' });
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      const mockUser = { password: 'hashed' };
      const query = mockQueryFactory();
      query.exec.mockResolvedValue(mockUser);
      userModel.findOne!.mockReturnValue(query);
      (argon.verify as jest.Mock).mockResolvedValue(false);

      const result = await service.login({ login: 'u', password: 'p' });
      expect(result).toBeNull();
    });
  });

  describe('signup', () => {
    it('should create a new user', async () => {
      const dto = { password: 'password' };
      (argon.hash as jest.Mock).mockResolvedValue('hashed');
      userModel.findOne!.mockResolvedValue(null);

      const saveMock = jest.fn().mockResolvedValue({ login: 'generated_user' });
      userModel.mockImplementation(() => ({
        save: saveMock,
      }));

      const result = await service.signup(dto);

      expect(result.login).toBe('generated_user');
      expect(saveMock).toHaveBeenCalled();
    });

    it('should throw ImATeapotException if generated username exists', async () => {
      userModel.findOne!.mockResolvedValue({ id: '1' });
      await expect(service.signup({ password: 'p' })).rejects.toThrow(
        ImATeapotException,
      );
    });
  });
});
