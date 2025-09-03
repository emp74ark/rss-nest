import { IsBoolean } from 'class-validator';

export class SubscriptionSettings {
  @IsBoolean()
  enabled?: boolean;

  @IsBoolean()
  loadFullText?: boolean;
}
