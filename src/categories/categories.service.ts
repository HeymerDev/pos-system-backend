import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity.js';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    await this.ensureNameIsAvailable(createCategoryDto.name);
    // INSERT ... RETURNING adds deletedAt even with select: false
    const { deletedAt: _deletedAt, ...category } =
      await this.categoryRepository.save(createCategoryDto);
    return category;
  }

  findAll() {
    return this.categoryRepository.find();
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException([`Category with ID ${id} not found`]);
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    if (updateCategoryDto.name) {
      await this.ensureNameIsAvailable(updateCategoryDto.name, id);
    }
    Object.assign(category, updateCategoryDto);
    await this.categoryRepository.save(category);

    return category;
  }

  async remove(id: number) {
    const category = await this.findOne(id);

    const products = await this.productRepository.count({
      where: { category: { id } },
    });
    if (products > 0) {
      throw new ConflictException([
        `Category with ID ${id} has ${products} products and cannot be deleted`,
      ]);
    }

    await this.categoryRepository.softRemove(category);
  }

  private async ensureNameIsAvailable(name: string, currentId?: number) {
    const existing = await this.categoryRepository.findOneBy({ name });
    if (existing && existing.id !== currentId) {
      throw new ConflictException([`Category ${name} already exists`]);
    }
  }
}
