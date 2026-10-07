import { IsNumberString, IsOptional } from 'class-validator';

export class FilterProductQueryDto {
  @IsOptional()
  @IsNumberString({}, { message: 'category id is invalid' })
  category_id?: number;

  @IsOptional()
  @IsNumberString({}, { message: 'category id is invalid' })
  total?: number;

  @IsOptional()
  @IsNumberString({}, { message: 'category id is invalid' })
  offset?: number;
}
