import { IsString, MaxLength, MinLength } from 'class-validator';

export class ApplyOwnerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  businessName: string;
}
