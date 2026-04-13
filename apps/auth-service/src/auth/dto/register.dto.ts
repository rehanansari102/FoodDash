import { IsEmail, IsString, MinLength, MaxLength, IsEnum, IsOptional, Matches } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class RegisterDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72) // bcrypt max
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
