import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppStatus } from './shared/entities';

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            health: jest.fn().mockReturnValue({
              status: AppStatus.Active,
              version: '1.0.0',
              uptime: '0d 0h 0m 1s',
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('health', () => {
    it('should return health status from service', () => {
      const result = controller.health();
      expect(result).toEqual({
        status: AppStatus.Active,
        version: '1.0.0',
        uptime: '0d 0h 0m 1s',
      });
      expect(service['health']).toHaveBeenCalled();
    });
  });
});
