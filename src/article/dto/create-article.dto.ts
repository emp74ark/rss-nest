import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateArticleDto {
  @IsMongoId()
  @IsOptional()
  userId?: string;

  @IsMongoId()
  @IsOptional()
  feedId?: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  creator?: string;

  @IsString()
  link: string;

  @IsDateString()
  pubDate: string;

  @IsString()
  @IsOptional()
  content: string;

  @IsString()
  @IsOptional()
  contentSnippet: string;

  @IsString()
  guid: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];

  @IsDateString()
  isoDate: Date;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  read?: boolean;

  @IsString()
  @IsOptional()
  fullText?: string;
}
