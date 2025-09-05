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
    @SessionUserId() sessionUserId: string,
  ) {
    return this.feedService.create({
      createFeedDto,
      userId: sessionUserId,
    });
  }

  @Get()
  findAll(
    @SessionUserId() sessionUserId: string,
    @GetPaginationArgs() paginationArgs: Pagination,
  ) {
    return this.feedService.findAll({
      userId: sessionUserId,
      pagination: paginationArgs,
    });
  }

  @Get('/refresh')
  refreshAll(@SessionUserId() sessionUserId: string) {
    return this.feedService.refreshAll({ userId: sessionUserId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feedService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateFeedDto,
  ) {
    return this.feedService.update(id, updateSubscriptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feedService.remove(id);
  }

  @Get(':id/refresh')
  refreshOne(@Param('id') id: string, @SessionUserId() sessionUserId: string) {
    return this.feedService.refreshOne({
      feedId: id,
      userId: sessionUserId,
    });
  }
}
