import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new tag
  async createTag(tagData: any) {
    try {
      if (!tagData.name) {
        throw new BadRequestException('Tag name is required.');
      }

      return await this.prisma.tag.create({
        data: {
          name: tagData.name,
          description: tagData.description,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create tag.');
    }
  }

  // Get all tags
  async getAllTags() {
    try {
      return await this.prisma.tag.findMany();
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve tags.');
    }
  }
}
