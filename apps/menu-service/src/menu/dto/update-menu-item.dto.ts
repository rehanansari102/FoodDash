import { IsString, IsNumber, IsOptional, IsBoolean, IsUrl, MaxLength, Min } from 'class-validator';

export class UpdateMenuItemDto {
  @IsOptional() @IsString() @MaxLength(100) name?: string;
  @IsOptional() @IsString() @MaxLength(300) description?: string;
  @IsOptional() @IsNumber() @Min(0) price?: number;
  @IsOptional() @IsString() @MaxLength(50) category?: string;
  @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) imageUrl?: string;
  @IsOptional() @IsBoolean() isAvailable?: boolean;
}
