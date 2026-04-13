import { IsString, IsNumber, IsOptional, IsBoolean, IsUrl, MaxLength, Min } from 'class-validator';

export class CreateMenuItemDto {
  @IsString() @MaxLength(100) name: string;
  @IsOptional() @IsString() @MaxLength(300) description?: string;
  @IsNumber() @Min(0) price: number;
  @IsString() @MaxLength(50) category: string;
  @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) imageUrl?: string;
  @IsOptional() @IsBoolean() isAvailable?: boolean;
}
