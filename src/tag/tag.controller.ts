import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { SessionUserId } from '../auth/decorators';
import { SessionGuard } from '../auth/guards';
import { GetPaginationArgs } from '../shared/decorators';
import { Pagination } from '../shared/entities';

@UseGuards(SessionGuard)
@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  create(@Body() createTagDto: CreateTagDto, @SessionUserId() userId: string) {
    return this.tagService.create({ userId, createTagDto });
  }

  @Get()
  findAll(
    @SessionUserId() userId: string,
    @GetPaginationArgs() paginationArgs: Pagination,
    @Query('default', new ParseBoolPipe({ optional: true }))
    defaultTags: boolean = false,
  ) {
    if (defaultTags) {
      return this.tagService.getDefaultTags();
    }
    return this.tagService.findAll({
      userId,
      pagination: paginationArgs,
    });
  }

  @Get(':name')
  findOne(@Param('name') name: string, @SessionUserId() userId: string) {
    return this.tagService.findOne({ tagName: name, userId });
  }

  @Patch(':name')
  update(
    @Param('name') name: string,
    @Body() updateTagDto: UpdateTagDto,
    @SessionUserId() userId: string,
  ) {
    return this.tagService.update({
      userId,
      tagName: name,
      updateTagDto,
    });
  }

  @Delete(':name')
  remove(@Param('name') name: string, @SessionUserId() userId: string) {
    return this.tagService.remove({ tagName: name, userId });
  }
}
