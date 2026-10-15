import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity.js';
import { FindManyOptions, Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const category = await this.categoriesService.findOne(
      createProductDto.categoryId,
    );

    return this.productRepository.save({ ...createProductDto, category });
  }

  async findAll(categoryId: number | null, take: number, skip: number) {
    const options: FindManyOptions<Product> = {
      relations: {
        category: true,
      },
      order: {
        id: 'DESC',
      },
      take,
      skip,
    };

    if (categoryId) {
      options.where = {
        category: { id: categoryId },
      };
    }

    const [data, total] = await this.productRepository.findAndCount(options);

    return { data, total };
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException([`Product with ID ${id} not found`]);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);

    if (updateProductDto.categoryId) {
      product.category = await this.categoriesService.findOne(
        updateProductDto.categoryId,
      );
    }
    await this.productRepository.save(product);
    return product;
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    await this.productRepository.softRemove(product);
  }
}
