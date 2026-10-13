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
import { ResponseMessage } from '../common/decorators/response-message/response-message.decorator.js';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ResponseMessage('Category created successfully')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
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
  @ResponseMessage('Category updated successfully')
  update(
    @Param('id', IdValidationPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  @ResponseMessage('Category deleted successfully')
  remove(@Param('id', IdValidationPipe) id: string) {
    return this.categoriesService.remove(+id);
  }
}
