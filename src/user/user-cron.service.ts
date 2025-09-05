import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UserService } from './user.service';

@Injectable()
export class UserCronService {
  constructor(private readonly userService: UserService) {}

  @Cron('* * * * * 1')
  removeOrphanedUsers() {
    this.userService.removeOrphaned();
  }
}
