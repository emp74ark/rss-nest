import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Role } from '../shared/entities';
import { NotFoundException } from '@nestjs/common';
import { of } from 'rxjs';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            removeOrphaned: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call userService.create', async () => {
      const dto = { login: 'test', password: 'p', role: Role.User };
      await controller.create(dto);
      expect(service['create']).toHaveBeenCalledWith(dto);
    });
  });

  describe('findSelf', () => {
    it('should return self user', async () => {
      const mockUser = { login: 'self' };
      (service.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await controller.findSelf('123');
      expect(result).toBe(mockUser);
      expect(service['findOne']).toHaveBeenCalledWith('123');
    });

    it('should throw NotFoundException if user not found', async () => {
      (service.findOne as jest.Mock).mockResolvedValue(null);
      await expect(controller.findSelf('123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const mockUser = { login: 'updated' };
      (service.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await controller.update('123', { login: 'updated' });
      expect(result).toBe(mockUser);
    });
  });

  describe('remove', () => {
    it('should call userService.remove', () => {
      (service.remove as jest.Mock).mockReturnValue(of({}));
      controller.remove('123');
      expect(service['remove']).toHaveBeenCalledWith('123');
    });
  });
});
