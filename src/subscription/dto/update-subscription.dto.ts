import { PartialType } from '@nestjs/mapped-types';
import { CreateSubscriptionDto } from './create-subscription.dto';
import {
  IsArray,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { SubscriptionSettings } from '../entities/subscription.entity';

export class UpdateSubscriptionDto extends PartialType(CreateSubscriptionDto) {
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
  settings: SubscriptionSettings;
}
