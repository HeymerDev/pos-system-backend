import { IsNumberString, IsOptional } from 'class-validator';

export class FilterProductQueryDto {
  @IsOptional()
  @IsNumberString({}, { message: 'category id is invalid' })
  category_id?: number;
}
