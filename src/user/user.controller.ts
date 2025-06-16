import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleGuard, SessionGuard } from '../auth/guards';
import { Role } from '../shared/enums';
import { RequiredRole } from '../auth/decorators';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(SessionGuard, RoleGuard)
  @Get()
  @RequiredRole(Role.Admin)
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(SessionGuard)
  @Get(':id')
  @RequiredRole(Role.User)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @UseGuards(SessionGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @UseGuards(SessionGuard)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
