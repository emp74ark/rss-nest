import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { FeedSettings } from '../entities/feed.entity';
import { Type } from 'class-transformer';

export class CreateFeedDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  link: string;

  @ValidateNested()
  @IsOptional()
  @Type(() => FeedSettings)
  settings?: FeedSettings;
}
