import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async createCategories(categoriesData: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({
        data: {
          name: categoriesData.name,
          description: categoriesData.description,
          icon: categoriesData.icon,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create category.');
    }
  }

  async getAllCategories() {
    try {
      return await this.prisma.category.findMany();
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve categories.');
    }
  }

  async updateCategory(id: number, updateData: UpdateCategoryDto) {
    try {
      const category = await this.prisma.category.update({
        where: { id },
        data: updateData,
      });
      return { message: 'Category updated successfully', category };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update category.');
    }
  }

  async deleteCategory(id: number) {
    try {
      await this.prisma.articleCategory.deleteMany({
        where: { categoryId: id },
      });
      await this.prisma.category.delete({ where: { id } });
      return { message: 'Category deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete category.');
    }
  }
}
