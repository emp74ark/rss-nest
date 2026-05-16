import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { AppStatus } from './shared/entities';

describe('AppService', () => {
  let service: AppService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('1.0.0'),
          },
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('health', () => {
    it('should return health status with version and uptime', () => {
      const mockUptime = 3661; // 1h 1m 1s
      jest.spyOn(global.process, 'uptime').mockReturnValue(mockUptime);

      const result = service.health();

      expect(result).toEqual({
        status: AppStatus.Active,
        version: '1.0.0',
        uptime: '0d 1h 1m 1s',
      });
      expect(configService['get']).toHaveBeenCalledWith('version');
    });

    it('should use default version if not provided', () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);
      jest.spyOn(global.process, 'uptime').mockReturnValue(0);

      const result = service.health();

      expect(result.version).toBe('0.0.0');
    });
  });
});
