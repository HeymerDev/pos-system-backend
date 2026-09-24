import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto.js';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsString({ message: 'The name must be a string' })
  @IsNotEmpty({ message: 'The name is required' })
  name: string;
}
