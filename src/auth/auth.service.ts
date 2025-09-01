import {
  ImATeapotException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthLogInDto, AuthSignUpDto } from './dto';
import * as argon from 'argon2';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { generateUsername } from 'unique-username-generator';
import { Role } from '../shared/entities';
import { AuthResponseMessage } from './enums';

@Injectable()
export class AuthService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  async login(dto: AuthLogInDto) {
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

    await this.userModel.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
    });

    return user;
  }

  async signup(dto: AuthSignUpDto) {
    const hash = await argon.hash(dto.password);
    const login = generateUsername();
    const existingUser = await this.userModel.findOne({ login });

    if (existingUser) {
      throw new ImATeapotException(AuthResponseMessage.TRY_LATER);
    }

    const user = await new this.userModel({
      login,
      role: Role.User,
      password: hash,
      lastLogin: new Date(),
    }).save();

    if (!user) {
      throw new UnauthorizedException(
        AuthResponseMessage.INCORRECT_CREDENTIALS,
      );
    }

    return user;
  }
}
