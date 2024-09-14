import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto } from 'src/articles/dto/index';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async incrementArticleViews(articleId: number, userId: number) {
    try {
      const hasViewed = await this.prisma.articleView.findUnique({
        where: {
          userId_articleId: {
            userId,
            articleId,
          },
        },
      });

      if (!hasViewed) {
        await this.prisma.article.update({
          where: { id: articleId },
          data: {
            views: {
              increment: 1,
            },
          },
        });

        await this.prisma.articleView.create({
          data: {
            userId,
            articleId,
          },
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to increment article views.',
      );
    }
  }

  async createArticle(articleData: CreateArticleDto) {
    try {
      const authorExists = await this.prisma.user.findUnique({
        where: { id: articleData.createdBy },
      });
      console.log(authorExists);

      if (!authorExists) {
        throw new BadRequestException('The author must be a valid user ID.');
      }
      return await this.prisma.article.create({
        data: { ...articleData },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create article.');
    }
  }

  async getArticle(articleId: string, userId: number) {
    try {
      await this.incrementArticleViews(parseInt(articleId), userId);
      const article = await this.prisma.article.findUnique({
        where: { id: parseInt(articleId) },
      });

      if (!article) {
        throw new NotFoundException(`Article with ID ${articleId} not found.`);
      }

      return article;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve article.');
    }
  }

  async updateArticle(articleId: string, updateData: any) {
    try {
      const articleExists = await this.prisma.article.findUnique({
        where: { id: parseInt(articleId) },
      });

      if (!articleExists) {
        throw new NotFoundException(`Article with ID ${articleId} not found.`);
      }

      return await this.prisma.article.update({
        where: { id: parseInt(articleId) },
        data: updateData,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update article.');
    }
  }

  async deleteArticle(articleId: string) {
    try {
      const articleExists = await this.prisma.article.findUnique({
        where: { id: parseInt(articleId) },
      });

      if (!articleExists) {
        throw new NotFoundException(`Article with ID ${articleId} not found.`);
      }

      return await this.prisma.article.delete({
        where: { id: parseInt(articleId) },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete article.');
    }
  }
}
