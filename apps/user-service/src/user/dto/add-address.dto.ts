import { IsString, IsNumber, IsBoolean, IsOptional, MaxLength, Min, Max } from 'class-validator';

export class AddAddressDto {
  @IsString() @MaxLength(30) label: string;
  @IsString() @MaxLength(200) street: string;
  @IsString() @MaxLength(100) city: string;
  @IsString() @MaxLength(100) country: string;
  @IsNumber() @Min(-90) @Max(90) lat: number;
  @IsNumber() @Min(-180) @Max(180) lng: number;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}
