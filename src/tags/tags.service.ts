import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new tag, optionally linking it to an article
  async createTag(tagData: CreateTagDto) {
    try {
      if (!tagData.name) {
        throw new BadRequestException('Tag name is required.');
      }

      const tag = await this.prisma.tag.create({
        data: {
          name: tagData.name,
          description: tagData.description,
        },
      });

      // Link tag to an article if articleId is provided
      if (tagData.articleId) {
        await this.prisma.articleTag.create({
          data: {
            articleId: tagData.articleId,
            tagId: tag.id,
          },
        });
      }

      return { message: 'Tag created successfully', tag };
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
