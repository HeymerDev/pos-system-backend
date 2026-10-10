import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service.js';
import { TransactionsController } from './transactions.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity.js';
import { TransactionContent } from './entities/transaction-content.entity.js';
import { Product } from '../products/entities/product.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, TransactionContent, Product]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
