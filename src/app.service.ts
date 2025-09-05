import { Injectable } from '@nestjs/common';
import * as process from 'node:process';
import { AppStatus } from './shared/entities';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  private uptimeFormat(uptime: number) {
    const days = Math.floor(uptime / (24 * 60 * 60));
    const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((uptime % (60 * 60)) / 60);
    const seconds = Math.floor(uptime % 60);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  health(): Record<string, string> {
    const version = this.configService.get<string>('version') || '0.0.0';
    const uptime = process.uptime();
    return {
      status: AppStatus.Active,
      version,
      uptime: this.uptimeFormat(uptime),
    };
  }
}
