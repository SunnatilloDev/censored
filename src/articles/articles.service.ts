import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto, UpdateArticleDto } from './dto';
import transformArticleData from 'src/articles/utils/rowToNiceStructure';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  // Get all articles
  async getAllArticles() {
    try {
      return (
        await this.prisma.article.findMany({
          include: {
            ArticleRating: true,
            author: true,
            ArticleTag: { include: { tag: true } },
            categories: { include: { category: true } },
          },
        })
      ).map((article) => transformArticleData(article));
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }


  // Increment article views
  async incrementArticleViews(articleId: number, userId: number) {
    try {
      if (!userId) return;

      const isValidUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      const hasViewed = await this.prisma.articleView.findUnique({
        where: {
          userId_articleId: { userId, articleId },
        },
      });

      if (!hasViewed && isValidUser) {
        await this.prisma.article.update({
          where: { id: articleId },
          data: {
            views: { increment: 1 },
          },
        });

        await this.prisma.articleView.create({
          data: { userId, articleId },
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to increment article views.',
      );
    }
  }

  // Create an article
  async createArticle(articleData: CreateArticleDto) {
    try {
      const authorExists = await this.prisma.user.findUnique({
        where: { id: articleData.authorId },
      });

      if (!authorExists) {
        throw new BadRequestException('The author must be a valid user ID.');
      }

      const article = await this.prisma.article.create({
        data: {
          title: articleData.title,
          subtitle: articleData.subtitle,
          content: JSON.stringify(articleData.content),
          conclusion: articleData.conclusion,
          authorId: articleData.authorId,
          status: articleData.status || 'Draft',
          categories: {
            connect: articleData.categories?.map((categoryId) => ({
              id: categoryId,
            })),
          },
          ArticleTag: {
            create: articleData.tags?.map((tagId) => ({
              tag: { connect: { id: Number(tagId) } },
            })),
          },
        },
      });

      return article;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create article.');
    }
  }

  // Retrieve an article
  async getArticle(articleId: string, userId?: number) {
    console.log('getArticle invoked with articleId:', articleId);
    try {
      const id = parseInt(articleId);
      if (isNaN(id)) throw new BadRequestException('Invalid article ID');

      const article = await this.prisma.article.findUnique({
        where: { id },
        include: {
          author: true,
          ArticleTag: { include: { tag: true } },
          categories: { include: { category: true } },
          ArticleView: true,
          ArticleRating: true,
        },
      });

      if (!article) {
        throw new NotFoundException(`Article with ID ${articleId} not found.`);
      }

      console.log('Article fetched:', article);

      await this.incrementArticleViews(id, userId);

      const tags =
        article.ArticleTag?.map((tagRelation) => tagRelation.tag.name) || [];
      const categories =
        article.categories?.map((catRelation) => catRelation.category.name) ||
        [];
      const avgRating =
        article.ArticleRating.reduce(
          (total, rating) => total + rating.rating,
          0,
        ) / article.ArticleRating.length;

      return {
        ...transformArticleData(article),
        tags,
        categories,
        avgRating: avgRating || 0,
      };
    } catch (error) {
      console.error('Error in getArticle:', error);
      throw new InternalServerErrorException('Failed to retrieve article.');
    }
  }

  // Update an article
  async updateArticle(articleId: string, updateData: UpdateArticleDto) {
    try {
      const articleExists = await this.prisma.article.findUnique({
        where: { id: parseInt(articleId) },
      });

      if (!articleExists) {
        throw new NotFoundException(`Article with ID ${articleId} not found.`);
      }

      return await this.prisma.article.update({
        where: { id: parseInt(articleId) },
        data: {
          ...updateData,
          content: updateData.content
            ? JSON.stringify(updateData.content)
            : undefined,
          categories: {
            connect: updateData.categories?.map((categoryId) => ({
              id: categoryId,
            })),
          },
          ArticleTag: {
            create: updateData.tags?.map((tagId) => ({
              tag: {
                connect: { id: Number(tagId) },
              },
            })),
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to update article.');
    }
  }

  // Delete an article
  async deleteArticle(articleId: string) {
    try {
      const articleExists = await this.prisma.article.findUnique({
        where: { id: parseInt(articleId) },
      });

      if (!articleExists) {
        throw new NotFoundException(`Article with ID ${articleId} not found.`);
      }

      await this.prisma.articleMedia.deleteMany({
        where: { articleId: parseInt(articleId) },
      });

      return await this.prisma.article.delete({
        where: { id: parseInt(articleId) },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete article.');
    }
  }

  // Rate an article
  async rateArticle(articleId: number, userId: number, rating: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.articleRating.upsert({
      where: {
        userId_articleId: { userId, articleId },
      },
      update: { rating },
      create: { userId, articleId, rating },
    });

    const aggregateResult = await this.prisma.articleRating.aggregate({
      where: { articleId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const averageRating = aggregateResult._avg.rating || 0;
    const totalRatings = aggregateResult._count.rating;

    await this.prisma.article.update({
      where: { id: articleId },
      data: {
        avgRating: averageRating,
        totalRatings,
      },
    });

    return { averageRating, totalRatings };
  }

  // Get article ratings
  async getRateArticle(articleId: number) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      include: {
        ArticleRating: true,
        author: true,
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const ratings = article.ArticleRating.map((rating) => ({
      rating: rating.rating,
      user: {
        username: article.author.username,
        photo_url: article.author.photo_url,
        name: `${article.author.firstName ?? ''} ${article.author.lastName ?? ''}`.trim(),
      },
    }));
    const averageRating =
      ratings.reduce((total, rating) => total + rating.rating, 0) /
      ratings.length;

    return { averageRating, ratings };
  }

  // Fetch top articles based on views and average rating
  async getTopArticles(limit: number, latest: boolean) {
    console.log('getTopArticles invoked with limit:', limit);
    try {
      const takeLimit = Number(limit);
      if (isNaN(takeLimit) || takeLimit <= 0) {
        throw new BadRequestException('Invalid limit parameter');
      }

      const topArticles = await this.prisma.article.findMany({
        take: takeLimit,
        orderBy: [
          { views: 'desc' },
          { avgRating: 'desc' },
          { createdAt: latest ? 'desc' : undefined },
        ],
        include: {
          ArticleRating: true,
          author: true,
          ArticleTag: { include: { tag: true } },
          categories: { include: { category: true } },
        },
      });

      return topArticles.map((article) => transformArticleData(article));
    } catch (error) {
      console.error('Error in getTopArticles:', error);
      throw new InternalServerErrorException('Failed to fetch top articles.');
    }
  }
  async reportScam(
    articleId: number,
    reportedById: number,
    reason: string,
    proof?: string,
  ) {
    try {
      const article = await this.prisma.article.findUnique({
        where: { id: articleId },
      });

      if (!article) {
        throw new NotFoundException(`Article with ID ${articleId} not found.`);
      }

      // Create a new ScamReport
      await this.prisma.scamReport.create({
        data: {
          articleId,
          reportedById,
          reason,
          proof,
        },
      });

      return { message: 'Scam report created successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to report scam.');
    }
  }

  // Method to remove a scam report
  async removeScamReport(reportId: number) {
    try {
      const report = await this.prisma.scamReport.findUnique({
        where: { id: reportId },
      });

      if (!report) {
        throw new NotFoundException(`Scam report with ID ${reportId} not found.`);
      }
  
      // Delete the scam report
      await this.prisma.scamReport.delete({
        where: { id: reportId },
      });

      return { message: 'Scam report removed successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to remove scam report.');
    }
  }
  async getScamReports(articleId: number) {
    try {
      const article = await this.prisma.article.findUnique({
        where: { id: articleId },
        include: { ScamReports: true },
      });

      if (!article) {
        throw new NotFoundException(`Article with ID ${articleId} not found.`);
      }

      return article.ScamReports;
    } catch (error) {

      throw new InternalServerErrorException('Failed to fetch scam reports.');
    }
  }
}