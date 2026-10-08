import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class TransactionContentsDto {
  @IsNotEmpty({ message: 'Product ID is not empty' })
  @IsInt({ message: 'Invalid product' })
  productId: number;

  @IsNotEmpty({ message: 'Quantity is not empty' })
  @IsInt({ message: 'Invalid quantity' }) // Validate quantity too
  quantity: number;

  @IsNotEmpty({ message: 'Price is not empty' })
  @IsNumber({}, { message: 'Invalid price' })
  price: number;
}
