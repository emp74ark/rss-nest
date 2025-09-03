import { Injectable } from '@nestjs/common';
import { CreateStatDto } from './dto/create-stat.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Stats } from '../schemas/stats.schema';

@Injectable()
export class StatsService {
  constructor(@InjectModel('Stats') private statsModel: Model<Stats>) {}
  create(createStatDto: CreateStatDto) {
    return this.statsModel.create(createStatDto);
  }

  findAll() {
    return this.statsModel.find();
  }

  findOne(id: number) {
    return this.statsModel.findById(id);
  }

  remove(id: number) {
    return this.statsModel.findByIdAndDelete(id);
  }
}
