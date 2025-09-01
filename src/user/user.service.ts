import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { Paginated, Pagination, Role } from '../shared/entities';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

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
}
