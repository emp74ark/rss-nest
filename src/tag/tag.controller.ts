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
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { SessionUserId } from '../auth/decorators';
import { SessionGuard } from '../auth/guards';

@UseGuards(SessionGuard)
@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  create(
    @Body() createTagDto: CreateTagDto,
    @SessionUserId() sessionUserId: string,
  ) {
    return this.tagService.create({ userId: sessionUserId, createTagDto });
  }

  @Get()
  findAll(@SessionUserId() sessionUserId: string) {
    return this.tagService.findAll({ userId: sessionUserId });
  }

  @Get(':name')
  findOne(@Param('name') name: string, @SessionUserId() sessionUserId: string) {
    return this.tagService.findOne({ tagName: name, userId: sessionUserId });
  }

  @Patch(':name')
  update(
    @Param('name') name: string,
    @Body() updateTagDto: UpdateTagDto,
    @SessionUserId() sessionUserId: string,
  ) {
    return this.tagService.update({
      userId: sessionUserId,
      tagName: name,
      updateTagDto,
    });
  }

  @Delete(':name')
  remove(@Param('name') name: string, @SessionUserId() sessionUserId: string) {
    return this.tagService.remove({ tagName: name, userId: sessionUserId });
  }
}
