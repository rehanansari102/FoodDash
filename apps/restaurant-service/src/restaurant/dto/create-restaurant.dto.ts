import {
  IsString, IsOptional, IsArray, IsNumber, IsBoolean,
  IsUrl, MaxLength, Min, Max, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @IsString() @MaxLength(200) street: string;
  @IsString() @MaxLength(100) city: string;
  @IsString() @MaxLength(100) country: string;
}

export class CreateRestaurantDto {
  @IsString() @MaxLength(100) name: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) cuisineTypes?: string[];

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  // Latitude and longitude for geo location
  @IsNumber() @Min(-90) @Max(90) lat: number;
  @IsNumber() @Min(-180) @Max(180) lng: number;

  @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) imageUrl?: string;
  @IsOptional() @IsNumber() @Min(0) minimumOrder?: number;
  @IsOptional() @IsNumber() @Min(0) deliveryFee?: number;
}

export class DayHoursDto {
  @IsNumber() @Min(0) @Max(6) day: number;
  @IsOptional() @IsString() open?: string;
  @IsOptional() @IsString() close?: string;
  @IsOptional() @IsBoolean() isClosed?: boolean;
}
