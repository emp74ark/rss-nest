import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleGuard, SessionGuard } from '../auth/guards';
import { Pagination, Role } from '../shared/entities';
import { RequiredRole, SessionUserId } from '../auth/decorators';
import { GetPaginationArgs } from '../shared/decorators';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(SessionGuard, RoleGuard)
  @Post()
  @RequiredRole(Role.Admin)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(SessionGuard, RoleGuard)
  @Get()
  @RequiredRole(Role.Admin)
  findAll(@GetPaginationArgs() paginationArgs: Pagination) {
    return this.userService.findAll({ pagination: paginationArgs });
  }

  @UseGuards(SessionGuard)
  @Get('/self')
  @RequiredRole(Role.User)
  async findSelf(@SessionUserId() sessionUserId: string) {
    const user = await this.userService.findOne(sessionUserId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @UseGuards(SessionGuard)
  @Get(':id')
  @RequiredRole(Role.User)
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @UseGuards(SessionGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.update(id, updateUserDto);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @UseGuards(SessionGuard)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
