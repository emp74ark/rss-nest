import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  async login(dto: AuthDto) {
    const user = await this.userModel.findOne({ login: dto.login });
    if (!user) {
      return new NotFoundException('No such user');
    }
    const isMatch = await argon.verify(user.password, dto.password);
    if (!isMatch) {
      return new ForbiddenException('Credentials are incorrect');
    }
    return user;
  }

  async signup(dto: AuthDto): Promise<User> {
    const hash = await argon.hash(dto.password);
    const user = new this.userModel({
      login: dto.login,
      password: hash,
    });
    return user.save();
  }

  logout() {
    return 'logout';
  }
}
