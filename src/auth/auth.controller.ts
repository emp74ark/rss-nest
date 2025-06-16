import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  Session,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { SessionGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: AuthDto,
    @Session() session: Record<string, unknown>,
  ) {
    const user = await this.authService.login(dto);
    if (!user) {
      throw new UnauthorizedException('Credentials are incorrect');
    }

    const userObject = user.toObject();
    Reflect.deleteProperty(userObject, 'password');
    session.user = userObject;

    return userObject;
  }

  @Post('signup')
  async signup(
    @Body() dto: AuthDto,
    @Session() session: Record<string, unknown>,
  ) {
    const user = await this.authService.signup(dto);
    if (!user) {
      throw new UnauthorizedException('Credentials are incorrect');
    }

    const userObject = user.toObject();
    Reflect.deleteProperty(userObject, 'password');
    session.user = userObject;

    return userObject;
  }

  @Get('logout')
  @UseGuards(SessionGuard)
  logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy((err) => {
      if (err) {
        throw InternalServerErrorException;
      }
    });

    return res
      .clearCookie('connect.sid')
      .status(200)
      .json({ message: 'You have been logged out' });
  }
}
