import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class FilterProductQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'The category ID must be an integer' })
  @Min(1, { message: 'The category ID must be greater than 0' })
  category_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'The total must be an integer' })
  @Min(1, { message: 'The total must be at least 1' })
  @Max(100, { message: 'The total cannot be greater than 100' })
  total: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'The offset must be an integer' })
  @Min(0, { message: 'The offset cannot be negative' })
  offset: number = 0;
}
