import { Module } from '@nestjs/common';
import { FeedParserService } from './feed-parser.service';

@Module({
  imports: [],
  providers: [FeedParserService],
  exports: [FeedParserService],
})
export class SharedModule {}
