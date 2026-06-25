import {
  IsString, IsOptional, MaxLength, Min, Max,
  IsInt,
} from 'class-validator';


export class CreateReviewDto {
  @IsOptional() @IsString() @MaxLength(100) title?: string;
  @IsString() @MaxLength(500) description?: string;
  @IsString() orderId!: string;
  @IsInt() @Min(1) @Max(5) rating!: number;
}
