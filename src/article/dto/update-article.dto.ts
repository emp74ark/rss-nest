import { PartialType } from '@nestjs/mapped-types';
import { CreateArticleDto } from './create-article.dto';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateArticleDto extends PartialType(CreateArticleDto) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ids?: string[];
}
