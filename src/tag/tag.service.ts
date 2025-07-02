import { Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tag } from '../schemas/tags.schema';

@Injectable()
export class TagService {
  constructor(
    @InjectModel('Tag')
    private tagModel: Model<Tag>,
  ) {}

  create({
    userId,
    createTagDto,
  }: {
    userId: string;
    createTagDto: CreateTagDto;
  }) {
    return this.tagModel.create(
      {
        userId: userId,
        ...createTagDto,
      },
      { new: true },
    );
  }

  findAll({ userId }: { userId: string }) {
    return this.tagModel.find({ userId: userId });
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
