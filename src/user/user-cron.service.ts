import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UserService } from './user.service';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UserCronService {
  constructor(private readonly userService: UserService) {}

  @Cron('* * * 1 * *')
  async removeOrphanedUsers() {
    await lastValueFrom(this.userService.removeOrphaned());
  }
}
