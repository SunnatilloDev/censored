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
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createCategories(@Body() categoriesData: CreateCategoryDto) {
    return await this.categoriesService.createCategories(categoriesData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved categories successfully',
  })
  @ApiResponse({ status: 500, description: 'Failed to retrieve categories' })
  async getAllCategories() {
    return await this.categoriesService.getAllCategories();
  }

  @Roles(Role.MODERATOR, Role.ADMIN, Role.OWNER)
  @Put(':id')
  @ApiOperation({ summary: 'Update an existing category by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 500, description: 'Failed to update category' })
  async updateCategory(
    @Param('id') id: string,
    @Body() updateData: UpdateCategoryDto,
  ) {
    return await this.categoriesService.updateCategory(Number(id), updateData);
  }

  @Roles(Role.MODERATOR, Role.ADMIN, Role.OWNER)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 500, description: 'Failed to delete category' })
  async deleteCategory(@Param('id') id: string) {
    return await this.categoriesService.deleteCategory(Number(id));
  }
}
