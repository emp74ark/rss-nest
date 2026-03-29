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
import { User, UserDocument } from '../schemas/user.schema';
import { Model, Types } from 'mongoose';
import { Paginated, Pagination, Role } from '../shared/entities';
import { appConfig } from '../config/dotenv';
import { Tag } from '../schemas/tags.schema';
import { SourceFeed } from '../schemas/feed.schema';
import * as argon from 'argon2';
import { AuthResponseMessage } from '../auth/auth.enums';
import { forkJoin, from, map, Observable, of, switchMap } from 'rxjs';

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

  async update(id: string, updateUserDto: UpdateUserDto) {
    const current = await this.userModel.findById(id);
    if (current?.role !== Role.Admin) {
      Reflect.deleteProperty(updateUserDto, 'role');
    }
    return this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
      select: { password: 0 },
    });
  }

  removeUserData({
    userIds,
  }: {
    userIds: Types.ObjectId[];
  }): Observable<{ deletedTags: number; deletedFeeds: number }> {
    return forkJoin({
      deletedTags: from(this.tagModel.deleteMany({ userId: { $in: userIds } })),
      deletedFeeds: from(
        this.feedModel.deleteMany({ userId: { $in: userIds } }),
      ),
    }).pipe(
      map(({ deletedTags, deletedFeeds }) => ({
        deletedTags: deletedTags.deletedCount,
        deletedFeeds: deletedFeeds.deletedCount,
      })),
    );
  }

  remove(id: string): Observable<UserDocument | null> {
    return from(this.userModel.findById(id)).pipe(
      switchMap((user) => {
        if (!user?._id) {
          throw new BadRequestException('User not found');
        }

        return this.removeUserData({ userIds: [user._id] }).pipe(
          switchMap(() =>
            from(
              this.userModel.findByIdAndDelete(user?._id, {
                select: { password: 0 },
              }),
            ),
          ),
        );
      }),
    );
  }

  removeOrphaned(): Observable<{
    deletedUsers: number;
    deletedFeeds: number;
    deletedTags: number;
  }> {
    const today = new Date();
    const dateThreshold = new Date();
    dateThreshold.setMonth(today.getMonth() - appConfig.orphanedUser);

    return from(
      this.userModel.distinct('_id', {
        lastLogin: { $lt: dateThreshold },
      }),
    ).pipe(
      switchMap((orphanedUserIds: Types.ObjectId[]) => {
        if (!orphanedUserIds.length) {
          return of({
            deletedUsers: 0,
            deletedFeeds: 0,
            deletedTags: 0,
          });
        }

        return forkJoin({
          userDataDeletion: this.removeUserData({ userIds: orphanedUserIds }),
          deletedUsers: from(
            this.userModel.deleteMany({ _id: { $in: orphanedUserIds } }),
          ),
        }).pipe(
          map(({ userDataDeletion, deletedUsers }) => {
            const { deletedTags, deletedFeeds } = userDataDeletion;
            if (deletedUsers.acknowledged) {
              this.logger.warn(
                `Removed ${
                  deletedUsers.deletedCount
                } users older than ${dateThreshold.toISOString()}. Removed related: ${deletedFeeds} feeds, ${deletedTags} tags.`,
              );
            }

            return {
              deletedUsers: deletedUsers.deletedCount,
              deletedFeeds,
              deletedTags,
            };
          }),
        );
      }),
    );
  }
}
