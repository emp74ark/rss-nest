import { Test, TestingModule } from '@nestjs/testing';
import { CrawlerService } from './crawler.service';
import { of } from 'rxjs';

describe('CrawlerService', () => {
  let service: CrawlerService;
  let mockBrowserService: { getDocument: jest.Mock };

  beforeEach(async () => {
    mockBrowserService = {
      getDocument: jest
        .fn()
        .mockReturnValue(of({ content: '<html></html>', error: false })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrawlerService,
        {
          provide: 'BrowserService',
          useValue: mockBrowserService,
        },
      ],
    }).compile();

    service = module.get<CrawlerService>(CrawlerService);

    // Manually set the private browserService since @Client is hard to mock in unit tests
    (service as unknown as Record<string, any>).browserService =
      mockBrowserService;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDocument', () => {
    it('should call browserService.getDocument and return result', (done) => {
      const url = 'http://test.com';
      service.getDocument({ url }).subscribe((result) => {
        expect(result.content).toBe('<html></html>');
        expect(mockBrowserService['getDocument']).toHaveBeenCalledWith({ url });
        done();
      });
    });
  });
});
