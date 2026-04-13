import { IsString, IsOptional, IsPhoneNumber, IsUrl, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(50) firstName?: string;
  @IsOptional() @IsString() @MaxLength(50) lastName?: string;
  @IsOptional() @IsPhoneNumber() phone?: string;
  @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) avatarUrl?: string;
}
