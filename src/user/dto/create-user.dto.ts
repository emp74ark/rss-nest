import { IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../../shared/entities';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  role: Role;
}
