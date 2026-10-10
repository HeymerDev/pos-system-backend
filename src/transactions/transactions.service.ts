import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity.js';
import { Repository } from 'typeorm';
import { TransactionContent } from './entities/transaction-content.entity.js';
import { Product } from '../products/entities/product.entity.js';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionContent)
    private readonly transactionContentRepository: Repository<TransactionContent>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    await this.productRepository.manager.transaction(async (entityManager) => {
      const transaction = new Transaction();
      transaction.total = createTransactionDto.total;

      for (const contents of createTransactionDto.contents) {
        const product = await entityManager.findOne(Product, {
          where: { id: contents.productId },
        });

        if (!product) {
          throw new NotFoundException(
            `Product with ID ${contents.productId} not found`,
          );
        }

        if (product.stock < contents.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product with ID ${contents.productId}`,
          );
        }

        product.stock -= contents.quantity;
        await entityManager.save(Product, product);

        const transactionContent = new TransactionContent();
        transactionContent.quantity = contents.quantity;
        transactionContent.price = contents.price;
        transactionContent.product = product;
        transactionContent.transaction = transaction;

        await entityManager.save(transaction);

        await entityManager.save(transactionContent);
      }
    });
    return 'Transaction created successfully';
  }

  findAll() {
    return `This action returns all transactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
