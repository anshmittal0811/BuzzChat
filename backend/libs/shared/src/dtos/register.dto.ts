import { IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid Email Address' })
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
