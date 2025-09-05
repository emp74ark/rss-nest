import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FeedService } from './feed.service';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { SessionGuard } from '../auth/guards';
import { SessionUserId } from '../auth/decorators';
import { GetPaginationArgs } from '../shared/decorators';
import { Pagination } from '../shared/entities';

@UseGuards(SessionGuard)
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Post()
  create(
    @Body() createFeedDto: CreateFeedDto,
    @SessionUserId() userId: string,
  ) {
    return this.feedService.create({
      createFeedDto,
      userId,
    });
  }

  @Get()
  findAll(
    @SessionUserId() userId: string,
    @GetPaginationArgs() paginationArgs: Pagination,
  ) {
    return this.feedService.findAll({
      userId,
      pagination: paginationArgs,
    });
  }

  @Get('/refresh')
  refreshAll(@SessionUserId() userId: string) {
    return this.feedService.refreshAll({ userId });
  }

  @Get(':id')
  findOne(@SessionUserId() userId: string, @Param('id') id: string) {
    return this.feedService.findOne({ id, userId });
  }

  @Patch(':id')
  update(
    @SessionUserId() userId: string,
    @Param('id') id: string,
    @Body() updateFeedDto: UpdateFeedDto,
  ) {
    return this.feedService.update({ id, updateFeedDto, userId });
  }

  @Delete(':id')
  remove(@SessionUserId() userId: string, @Param('id') id: string) {
    return this.feedService.remove({ id, userId });
  }

  @Get(':id/refresh')
  refreshOne(@Param('id') id: string, @SessionUserId() userId: string) {
    return this.feedService.refreshOne({
      feedId: id,
      userId,
    });
  }
}
