import { Module } from '@nestjs/common';
import { FeedParserService } from './feed-parser.service';
import { CrawlerService } from './crawler.service';

@Module({
  imports: [],
  providers: [FeedParserService, CrawlerService],
  exports: [FeedParserService, CrawlerService],
})
export class SharedModule {}
