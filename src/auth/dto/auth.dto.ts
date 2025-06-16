import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from '../../shared/entities';

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
