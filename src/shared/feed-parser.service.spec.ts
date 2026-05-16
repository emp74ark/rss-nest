import { Test, TestingModule } from '@nestjs/testing';
import { FeedParserService } from './feed-parser.service';
import { NotFoundException } from '@nestjs/common';
import Parser from 'rss-parser';

jest.mock('rss-parser', () => {
  return jest.fn().mockImplementation(() => {
    return {
      parseURL: jest.fn(),
    };
  });
});

describe('FeedParserService', () => {
  let service: FeedParserService;
  let mockParserInstance: { parseURL: jest.Mock };

  beforeEach(async () => {
    mockParserInstance = {
      parseURL: jest.fn(),
    };
    (Parser as unknown as jest.Mock).mockImplementation(
      () => mockParserInstance,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [FeedParserService],
    }).compile();

    service = module.get<FeedParserService>(FeedParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkFeedAvailability', () => {
    it('should return true if fetch returns 200 ok', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
      });

      const result = await service.checkFeedAvailability({
        link: 'http://test.com',
      });
      expect(result).toBe(true);
    });

    it('should return false if fetch returns not ok', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await service.checkFeedAvailability({
        link: 'http://test.com',
      });
      expect(result).toBe(false);
    });

    it('should return false if fetch throws', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await service.checkFeedAvailability({
        link: 'http://test.com',
      });
      expect(result).toBe(false);
    });
  });

  describe('parseRssFeed', () => {
    it('should parse and return items, handling encoded content', async () => {
      const mockItems = [
        { title: 'Item 1', guid: '1' },
        {
          title: 'Item 2',
          guid: '2',
          'content:encoded': 'Encoded content',
          'content:encodedSnippet': 'Snippet',
        },
      ];
      mockParserInstance.parseURL.mockResolvedValue({ items: mockItems });

      const result = await service.parseRssFeed({ link: 'http://test.com' });

      expect(result).toBeDefined();
      if (result) {
        expect(result[1].content).toBe('Encoded content');
        expect(result[1].contentSnippet).toBe('Snippet');
      }
    });

    it('should log error if parsing fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockParserInstance.parseURL.mockRejectedValue(new Error('Parse error'));

      await service.parseRssFeed({ link: 'http://test.com' });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('getNewArticles', () => {
    it('should return only new articles', async () => {
      jest.spyOn(service, 'checkFeedAvailability').mockResolvedValue(true);
      jest.spyOn(service, 'parseRssFeed').mockResolvedValue([
        { guid: '1', title: 'A' },
        { guid: '2', title: 'B' },
      ] as any);

      const result = await service.getNewArticles({
        link: 'http://test.com',
        guids: ['1'],
      });

      expect(result).toBeDefined();
      if (result) {
        expect(result[0].guid).toBe('2');
      }
    });

    it('should throw NotFoundException if feed is unavailable', async () => {
      jest.spyOn(service, 'checkFeedAvailability').mockResolvedValue(false);

      await expect(
        service.getNewArticles({ link: 'http://test.com', guids: [] }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
