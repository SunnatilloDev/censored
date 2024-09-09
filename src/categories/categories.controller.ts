import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateCategoryDto } from 'src/categories/dto/index';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async createCategories(@Body() categoriesData: CreateCategoryDto) {
    return await this.categoriesService.createCategories(categoriesData);
  }

  @Get()
  async getAllCategories() {
    return await this.categoriesService.getAllCategories();
  }
}
