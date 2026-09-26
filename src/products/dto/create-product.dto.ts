import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'The name must be a string' })
  @IsNotEmpty({ message: 'The name is required' })
  name: string;

  @IsString({ message: 'The image URL must be a string' })
  @IsOptional()
  image_url?: string;

  @IsNotEmpty({ message: 'The price is required' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'The price must be a number' })
  @IsPositive({ message: 'The price must be a positive number' })
  price: number;

  @IsNotEmpty({ message: 'The stock is required' })
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'The stock must be a int' })
  stock: number;

  @IsNotEmpty({ message: 'The category ID is required' })
  @IsInt({ message: 'The category ID must be a number' })
  categoryId: number;
}
