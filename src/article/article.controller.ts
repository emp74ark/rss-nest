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
    @SessionUserId() sessionUserId: string,
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
    @Query('subscription') subscription?: string,
  ) {
    return this.articleService.findAllByUser({
      userId: sessionUserId,
      pagination: paginationArgs,
      filter: {
        read,
        tags,
        subscription,
      },
      sort: {
        date: dateSort,
      },
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articleService.findOne(id);
  }

  @Get(':id/full')
  fullText(@Param('id') id: string) {
    return this.articleService.getFullText({ id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articleService.updateOne(id, updateArticleDto);
  }

  @Patch()
  updateMany(
    @Body() updateArticleDto: UpdateArticleDto & { ids: string[] },
    @Query('all', ParseBoolPipe) all: boolean,
  ) {
    if (all) {
      return this.articleService.updateAll({ article: updateArticleDto });
    }
    return this.articleService.updateMany({
      ids: updateArticleDto.ids,
      article: updateArticleDto,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articleService.remove(id);
  }
}
