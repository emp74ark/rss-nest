import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  ParseBoolPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { SessionUserId } from '../auth/decorators';
import { GetPaginationArgs } from '../shared/decorators';
import { Pagination, SortOrder } from '../shared/entities';
import { SessionGuard } from '../auth/guards';

@UseGuards(SessionGuard)
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articleService.create(createArticleDto);
  }

  @Get()
  findAll(
    @SessionUserId() userId: string,
    @GetPaginationArgs() paginationArgs: Pagination,
    @Query('read') read?: 'true' | 'false',
    @Query(
      'tags',
      new ParseArrayPipe({
        optional: true,
        items: String,
      }),
    )
    tags?: string[],
    @Query('dateSort')
    dateSort: SortOrder = SortOrder.Desc,
    @Query('feed') feed?: string,
  ) {
    return this.articleService.findAllByUser({
      userId,
      pagination: paginationArgs,
      filter: {
        read,
        tags,
        feed,
      },
      sort: {
        date: dateSort,
      },
    });
  }

  @Get(':id')
  findOne(@SessionUserId() userId: string, @Param('id') id: string) {
    return this.articleService.findOne({ id, userId });
  }

  @Get(':id/full')
  fullText(@SessionUserId() userId: string, @Param('id') id: string) {
    return this.articleService.getFullText({ id, userId });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @SessionUserId() userId: string,
  ) {
    return this.articleService.updateOne({ id, updateArticleDto, userId });
  }

  @Patch()
  updateMany(
    @SessionUserId() userId: string,
    @Body() updateArticleDto: UpdateArticleDto & { ids: string[] },
    @Query('all', ParseBoolPipe) all: boolean,
  ) {
    if (all) {
      return this.articleService.updateAll({
        article: updateArticleDto,
        userId,
      });
    }
    return this.articleService.updateMany({
      ids: updateArticleDto.ids,
      article: updateArticleDto,
      userId,
    });
  }

  @Delete(':id')
  remove(@SessionUserId() userId: string, @Param('id') id: string) {
    return this.articleService.remove({ id, userId });
  }
}
