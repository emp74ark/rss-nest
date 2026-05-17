import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  Session,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLogInDto, AuthSignUpDto } from './dto';
import { SessionGuard } from './guards';
import { AuthLogInterceptor } from './interceptors/auth-log.interceptor';
import { AuthResponseMessage } from './auth.enums';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(AuthLogInterceptor)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: AuthLogInDto,
    @Session() session: Record<string, unknown>,
  ) {
    const user = await this.authService.login(dto);
    if (!user) {
      throw new UnauthorizedException(
        AuthResponseMessage.INCORRECT_CREDENTIALS,
      );
    }

    const userObject = user.toObject();
    Reflect.deleteProperty(userObject, 'password');
    session.user = userObject;

    return userObject;
  }

  @UseInterceptors(AuthLogInterceptor)
  @Post('signup')
  async signup(
    @Body() dto: AuthSignUpDto,
    @Session() session: Record<string, unknown>,
  ) {
    const user = await this.authService.signup(dto);
    const userObject = user.toObject();
    Reflect.deleteProperty(userObject, 'password');
    session.user = userObject;

    return userObject;
  }

  @Get('logout')
  @UseGuards(SessionGuard)
  async logout(@Req() req: any) {
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err: Error) => {
        if (err) {
          reject(new InternalServerErrorException());
        }
        resolve();
      });
    });

    return { message: AuthResponseMessage.LOGGED_OUT };
  }
}
