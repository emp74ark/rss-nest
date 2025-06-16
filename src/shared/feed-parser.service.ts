import { Injectable } from '@nestjs/common';
import Parser from 'rss-parser';
import { RssItem, RssSource } from './entities';

@Injectable()
export class FeedParserService {
  #rssParser = new Parser<RssSource, RssItem>({
    maxRedirects: 10,
  });

  parseRssFeed = async ({ link }: { link: string }) => {
    try {
      const { items } = await this.#rssParser.parseURL(link);
      return items;
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
    const parsedFeed = await this.parseRssFeed({ link });
    return parsedFeed?.filter(({ guid }) => !guids.includes(guid));
  };
}
