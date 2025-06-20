import { IsEmail, IsStrongPassword } from 'class-validator';

export class CreateUserRquest {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;
}
