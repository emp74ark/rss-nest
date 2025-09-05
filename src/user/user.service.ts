import {
  BadRequestException,
  ImATeapotException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { Model, Types } from 'mongoose';
import { Paginated, Pagination } from '../shared/entities';
import { appConfig } from '../config/dotenv';
import { Tag } from '../schemas/tags.schema';
import { SourceFeed } from '../schemas/feed.schema';
import * as argon from 'argon2';
import { AuthResponseMessage } from '../auth/auth.enums';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Feed') private feedModel: Model<SourceFeed>,
    @InjectModel('Tag') private tagModel: Model<Tag>,
  ) {}
  private readonly logger = new Logger('UserService');

  async create(createUserDto: CreateUserDto) {
    const hash = await argon.hash(createUserDto.password);

    const existingUser = await this.userModel.findOne({
      login: createUserDto.login,
    });

    if (existingUser) {
      throw new ImATeapotException(AuthResponseMessage.TRY_LATER);
    }

    const user = await new this.userModel({
      login: createUserDto.login,
      role: createUserDto.role,
      password: hash,
      lastLogin: new Date(),
    }).save();

    if (!user) {
      throw new InternalServerErrorException('Failed to create user');
    }

    const userObject = user.toObject();
    Reflect.deleteProperty(userObject, 'password');

    return userObject;
  }

  async findAll({
    pagination,
  }: {
    pagination: Pagination;
  }): Promise<Paginated<User>> {
    const result: Paginated<User>[] = await this.userModel.aggregate([
      {
        $facet: {
          count: [{ $count: 'total' }],
          current: [
            {
              $skip: (pagination.pageNumber - 1) * pagination.perPage,
            },
            {
              $limit: pagination.perPage,
            },
            {
              $project: { password: 0 },
            },
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

  findOne(id: string) {
    return this.userModel.findById(id, { password: 0 });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
      select: { password: 0 },
    });
  }

  async removeUserData({ userIds }: { userIds: Types.ObjectId[] }) {
    const deletedTags = await this.tagModel.deleteMany({
      userId: { $in: userIds.map((el) => el._id.toHexString()) },
    });

    const deletedFeeds = await this.feedModel.deleteMany({
      userId: { $in: userIds },
    });

    return {
      deletedTags: deletedTags.deletedCount,
      deletedFeeds: deletedFeeds.deletedCount,
    };
  }

  async remove(id: string) {
    const user = await this.userModel.findById(id);

    if (!user?._id) {
      throw new BadRequestException('User not found');
    }

    await this.removeUserData({ userIds: [user._id] });

    return this.userModel.findByIdAndDelete(user?._id, {
      select: { password: 0 },
    });
  }

  async removeOrphaned() {
    const today = new Date();
    const dateThreshold = new Date();
    dateThreshold.setMonth(today.getMonth() - appConfig.orphanedUser);
    const orphanedUser = await this.userModel.find({
      lastLogin: { $lt: dateThreshold },
    });

    const orphanedUserIds = orphanedUser.map((u) => u._id);
    console.log('IDS', orphanedUserIds);

    const { deletedTags, deletedFeeds } = await this.removeUserData({
      userIds: orphanedUserIds,
    });

    const deletedUsers = await this.userModel.deleteMany({
      _id: { $in: orphanedUserIds },
    });

    if (deletedUsers.acknowledged) {
      this.logger.warn(
        `Removed ${deletedUsers.deletedCount} users older than ${dateThreshold.toISOString()}. Removed related: ${deletedFeeds} feeds, ${deletedTags} tags.`,
      );
    }

    return {
      deletedUsers: deletedUsers.deletedCount,
      deletedFeeds,
      deletedTags,
    };
  }
}
