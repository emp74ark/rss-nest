import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tag } from '../schemas/tags.schema';
import { Paginated, Pagination } from '../shared/entities';

@Injectable()
export class TagService implements OnModuleInit {
  constructor(
    @InjectModel('Tag')
    private tagModel: Model<Tag>,
  ) {}

  async onModuleInit() {
    await this.createFav();
  }

  async createFav() {
    const existing = await this.tagModel.findOne({
      userId: 'all',
      name: 'fav',
    });
    if (!existing) {
      await this.tagModel.create({
        userId: 'all',
        name: 'fav',
      });
    }
  }

  getDefaultTags() {
    return this.tagModel.find({ userId: 'all' });
  }

  create({
    userId,
    createTagDto,
  }: {
    userId: string;
    createTagDto: CreateTagDto;
  }) {
    return this.tagModel.create({
      userId: userId,
      ...createTagDto,
    });
  }

  async findAll({
    userId,
    pagination,
  }: {
    userId: string;
    pagination: Pagination;
  }) {
    const result: Paginated<Tag>[] = await this.tagModel.aggregate([
      { $match: { userId: { $in: [userId, 'all'] } } },
      {
        $facet: {
          count: [{ $count: 'total' }],
          current: [
            { $skip: (pagination.pageNumber - 1) * pagination.perPage },
            { $limit: pagination.perPage },
          ],
        },
      },
      {
        $project: {
          total: { $ifNull: [{ $arrayElemAt: ['$count.total', 0] }, 0] },
          result: '$current',
        },
      },
    ]);

    if (result.length === 0) {
      return {
        total: 0,
        result: [],
      };
    }

    return result[0];
  }

  findOne({ userId, tagName }: { userId: string; tagName: string }) {
    return this.tagModel.findOne({ userId: userId, name: tagName });
  }

  update({
    userId,
    tagName,
    updateTagDto,
  }: {
    userId: string;
    tagName: string;
    updateTagDto: UpdateTagDto;
  }) {
    return this.tagModel.findOneAndUpdate(
      { userId: userId, name: tagName },
      { $set: updateTagDto },
      { new: true },
    );
  }

  remove({ userId, tagName }: { userId: string; tagName: string }) {
    return this.tagModel.deleteOne({ userId: userId, name: tagName });
  }
}
