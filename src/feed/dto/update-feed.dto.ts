import { PartialType } from '@nestjs/mapped-types';
import { CreateFeedDto } from './create-feed.dto';
import {
  IsArray,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { FeedSettings } from '../entities/feed.entity';
import { Type } from 'class-transformer';

export class UpdateFeedDto extends PartialType(CreateFeedDto) {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  articles: string[];

  @ValidateNested()
  @Type(() => FeedSettings)
  settings: FeedSettings;
}
