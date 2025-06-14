import { Injectable } from '@nestjs/common';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  async login(dto: AuthDto) {
    const user = await this.userModel
      .findOne({ login: dto.login })
      .select('+password');
    if (!user) {
      return null;
    }

    const isMatch = await argon.verify(user.password, dto.password);
    if (!isMatch) {
      return null;
    }

    return user;
  }

  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);
    const user = await new this.userModel({
      login: dto.login,
      password: hash,
    }).save();

    if (!user) {
      return null;
    }

    return user;
  }
}
