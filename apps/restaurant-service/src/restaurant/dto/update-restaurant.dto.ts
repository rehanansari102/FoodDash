import {
  IsString, IsOptional, IsArray, IsBoolean,
  IsUrl, MaxLength, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from './create-restaurant.dto';

export class UpdateRestaurantDto {
  @IsOptional() @IsString() @MaxLength(100) name?: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) cuisineTypes?: string[];
  @IsOptional() @ValidateNested() @Type(() => AddressDto) address?: AddressDto;
  @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) imageUrl?: string;
  @IsOptional() @IsBoolean() isOpen?: boolean;
}
