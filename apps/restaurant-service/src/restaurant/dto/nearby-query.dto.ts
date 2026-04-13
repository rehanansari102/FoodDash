import { IsNumber, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class NearbyQueryDto {
  @Type(() => Number) @IsNumber() @Min(-90) @Max(90) lat: number;
  @Type(() => Number) @IsNumber() @Min(-180) @Max(180) lng: number;

  // Radius in kilometers, default 5km, max 50km
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0.1) @Max(50) radius?: number;
}
