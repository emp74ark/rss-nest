import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { Paginated, Pagination, Role } from '../shared/entities';
import { appConfig } from '../config/dotenv';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}
  private readonly logger = new Logger('UserService');

  create(createUserDto: CreateUserDto) {
    if (!Object.values(Role).includes(createUserDto.role)) {
      throw new BadRequestException(
        `Invalid role: ${createUserDto.role}. Supported roles are: ${Object.values(Role).join(', ')}`,
      );
    }
    return this.userModel.create(createUserDto);
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
    return this.userModel.findById(id);
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
    });
  }

  remove(id: string) {
    this.userModel.findByIdAndDelete(id);
  }

  removeOrphaned() {
    const today = new Date();
    const dateThreshold = new Date();
    dateThreshold.setMonth(today.getMonth() - appConfig.orphanedUser);
    this.logger.warn(
      `Removing users older than ${dateThreshold.toISOString()}`,
    );
    this.userModel.deleteMany({
      lastLogin: { $lt: dateThreshold },
    });
  }
}
