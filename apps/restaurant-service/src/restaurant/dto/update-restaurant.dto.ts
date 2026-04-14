import {
  IsString, IsOptional, IsArray, IsBoolean, IsNumber,
  IsUrl, MaxLength, Min, ValidateNested,
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
  @IsOptional() @IsNumber() @Min(0) minimumOrder?: number;
  @IsOptional() @IsNumber() @Min(0) deliveryFee?: number;
}
