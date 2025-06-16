import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { SubscriptionSettings } from '../entities/subscription.entity';

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  link: string;

  @ValidateNested()
  @IsOptional()
  settings?: SubscriptionSettings;
}
