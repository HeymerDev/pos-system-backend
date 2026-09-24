import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { IdValidationPipe } from '../common/pipes/id-validation-pipe/id-validation-pipe.pipe.js';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const data = await this.categoriesService.create(createCategoryDto);
    return {
      status: 'success',
      message: 'Category created successfully',
      data,
    };
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', IdValidationPipe)
    id: string,
  ) {
    return this.categoriesService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id', IdValidationPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const data = await this.categoriesService.update(+id, updateCategoryDto);

    return {
      status: 'success',
      message: 'Category updated successfully',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id', IdValidationPipe) id: string) {
    const message = await this.categoriesService.remove(+id);

    return {
      status: 'success',
      message,
    };
  }
}
