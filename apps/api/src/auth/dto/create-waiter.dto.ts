import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateWaiterDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @IsEmail()
  email: string;
}
