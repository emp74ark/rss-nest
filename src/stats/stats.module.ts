import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { StatsSchema } from '../schemas/stats.schema';

@Module({
  controllers: [StatsController],
  providers: [StatsService],
  imports: [
    MongooseModule.forFeature([{ name: 'Stats', schema: StatsSchema }]),
  ],
})
export class StatsModule {}
