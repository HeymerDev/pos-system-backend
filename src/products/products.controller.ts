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
import { IdValidationPipe } from '../common/pipes/id-validation-pipe/id-validation-pipe.pipe.js';
import { ResponseMessage } from '../common/decorators/response-message/response-message.decorator.js';
import { PaginatedResult } from '../common/interceptors/response/paginated-result.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ResponseMessage('Product created successfully')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
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
    return new PaginatedResult(data, total);
  }

  @Get(':id')
  findOne(@Param('id', IdValidationPipe) id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  @ResponseMessage('Product updated successfully')
  update(
    @Param('id', IdValidationPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @ResponseMessage('Product deleted successfully')
  remove(@Param('id', IdValidationPipe) id: string) {
    return this.productsService.remove(+id);
  }
}
