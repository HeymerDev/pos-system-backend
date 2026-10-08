import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Length,
  ValidateNested,
} from 'class-validator';
import { TransactionContentsDto } from './transaction-content.dto.js';

export class CreateTransactionDto {
  @IsNotEmpty({ message: 'Total is not empty' })
  @IsNumber({}, { message: 'Invalid total' })
  total: number;

  @IsArray()
  @ArrayNotEmpty({ message: 'Contents is not empty' })
  @ValidateNested()
  @Type(() => TransactionContentsDto)
  contents: TransactionContentsDto[];
}
