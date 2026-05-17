import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { AuthResponseMessage } from './auth.enums';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            signup: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should login and set session user', async () => {
      const mockUser = {
        toObject: jest.fn().mockReturnValue({ login: 'test' }),
      };
      (service.login as jest.Mock).mockResolvedValue(mockUser);
      const session = {} as Record<string, any>;

      const result = await controller.login(
        { login: 'u', password: 'p' },
        session,
      );

      expect(result).toEqual({ login: 'test' });
      expect(session['user']).toEqual({ login: 'test' });
    });

    it('should throw UnauthorizedException if login fails', async () => {
      (service.login as jest.Mock).mockResolvedValue(null);
      await expect(
        controller.login({ login: 'u', password: 'p' }, {}),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signup', () => {
    it('should signup and set session user', async () => {
      const mockUser = {
        toObject: jest.fn().mockReturnValue({ login: 'new' }),
      };
      (service.signup as jest.Mock).mockResolvedValue(mockUser);
      const session = {} as Record<string, any>;

      const result = await controller.signup({ password: 'p' }, session);

      expect(result).toEqual({ login: 'new' });
      expect(session['user']).toEqual({ login: 'new' });
    });
  });

  describe('logout', () => {
    it('should destroy session and return success message', async () => {
      const req = {
        session: {
          destroy: jest.fn((cb) => cb(null)),
        },
      } as any;

      const result = await controller.logout(req);

      expect(req.session.destroy).toHaveBeenCalled();
      expect(result).toEqual({ message: AuthResponseMessage.LOGGED_OUT });
    });
  });
});
