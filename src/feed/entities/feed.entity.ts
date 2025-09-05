import { IsBoolean } from 'class-validator';

export class FeedSettings {
  @IsBoolean()
  enabled?: boolean;
}
