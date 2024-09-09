import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async createCategories(categoriesData: any) {
    try {
      if (!categoriesData.name) {
        throw new BadRequestException('Category name is required.');
      }

      return await this.prisma.category.create({
        data: {
          name: categoriesData.name,
          description: categoriesData.description,
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
}
