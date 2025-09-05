import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StatsService } from './stats.service';
import { RoleGuard, SessionGuard } from '../auth/guards';
import { RequiredRole } from '../auth/decorators';
import { Role } from '../shared/entities';
import { CreateStatDto } from './dto/create-stat.dto';
import { Request } from 'express';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('/new')
  async create(
    @Req() req: Request,
    @Query('source') source: string,
    @Query('timestamp', ParseIntPipe) timestamp: number,
  ) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const dto = new CreateStatDto({
      source,
      timestamp,
      ip,
      headers: req.headers,
    });
    await this.statsService.create(dto);
    return { message: 'ok' };
  }

  @UseGuards(SessionGuard, RoleGuard)
  @RequiredRole(Role.Admin)
  @Get('/all')
  findAll() {
    return this.statsService.findAll();
  }

  @UseGuards(SessionGuard, RoleGuard)
  @RequiredRole(Role.Admin)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.statsService.findOne(id);
  }

  @UseGuards(SessionGuard, RoleGuard)
  @RequiredRole(Role.Admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.statsService.remove(id);
  }
}
