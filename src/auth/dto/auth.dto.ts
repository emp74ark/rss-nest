import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from '../../shared/enums';

export class AuthDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  role?: Role;
}
