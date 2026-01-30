import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../../entities/user.entity';

export const STAFF_ROLES = [UserRole.WAITER, UserRole.KITCHEN] as const;

export class CreateStaffDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @IsEmail()
  email: string;

  @IsIn([UserRole.WAITER, UserRole.KITCHEN])
  role: UserRole;
}
