import { IsNotEmpty, IsString } from 'class-validator';

export class AuthLogInDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AuthSignUpDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}
