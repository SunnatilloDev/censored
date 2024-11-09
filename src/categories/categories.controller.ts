import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  @Roles(Role.MODERATOR, Role.ADMIN, Role.OWNER)
  @Post()
  async createCategories(@Body() categoriesData: CreateCategoryDto) {
    return await this.categoriesService.createCategories(categoriesData);
  }

  @Get()
  async getAllCategories() {
    return await this.categoriesService.getAllCategories();
  }
  @Roles(Role.MODERATOR, Role.ADMIN, Role.OWNER)
  @Put(':id')
  async updateCategory(
    @Param('id') id: string,
    @Body() updateData: UpdateCategoryDto,
  ) {
    return await this.categoriesService.updateCategory(Number(id), updateData);
  }
  @Roles(Role.MODERATOR, Role.ADMIN, Role.OWNER)
  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    return await this.categoriesService.deleteCategory(Number(id));
  }
}
