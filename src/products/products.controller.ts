import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { FilterProductQueryDto } from './dto/filter-product.dto.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const data = await this.productsService.create(createProductDto);

    return {
      status: 'success',
      message: 'Product created successfully',
      data,
    };
  }

  @Get()
  async findAll(@Query() query: FilterProductQueryDto) {
    const categoryId = query.category_id ? query.category_id : null;
    const take = query.total ? query.total : 10;
    const skip = query.offset ? query.offset : 0;

    const { data, total } = await this.productsService.findAll(
      categoryId,
      take,
      skip,
    );
    return {
      status: 'success',
      data,
      total,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
