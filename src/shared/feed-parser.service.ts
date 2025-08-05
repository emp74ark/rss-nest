import { Injectable, NotFoundException } from '@nestjs/common';
import Parser from 'rss-parser';
import { RssItem, RssSource } from './entities';

@Injectable()
export class FeedParserService {
  #rssParser = new Parser<RssSource, RssItem>({
    maxRedirects: 10,
  });

  checkFeedAvailability = async ({ link }: { link: string }) => {
    try {
      const response = await fetch(link);
      return response.ok && response.status === 200;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  hasEncodedContent = (
    rssItem: RssItem,
  ): rssItem is RssItem & {
    'content:encoded': string;
    'content:encodedSnippet': string;
  } => {
    return Reflect.has(rssItem, 'content:encoded');
  };

  parseRssFeed = async ({ link }: { link: string }) => {
    try {
      const { items } = await this.#rssParser.parseURL(link);
      return items.map((item) => {
        if (this.hasEncodedContent(item)) {
          item.content = item['content:encoded'];
          item.contentSnippet = item['content:encodedSnippet'];
        }
        return item;
      });
    } catch (error) {
      console.error(error);
    }
  };

  getNewArticles = async ({
    link,
    guids,
  }: {
    guids: string[];
    link: string;
  }) => {
    const isFeedAvailable = await this.checkFeedAvailability({ link });
    if (!isFeedAvailable) {
      throw new NotFoundException('Feed not found');
    }
    const parsedFeed = await this.parseRssFeed({ link });
    return parsedFeed?.filter(({ guid }) => !guids.includes(guid));
  };
}
