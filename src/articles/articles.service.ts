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
      if (!userId) return;
      const isValidUser = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      const hasViewed = await this.prisma.articleView.findUnique({
        where: {
          userId_articleId: {
            userId,
            articleId,
          },
        },
      });

      if (!hasViewed && isValidUser) {
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

  async createArticle(articleData: CreateArticleDto, mediaUrls: string[]) {
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
          content: articleData.content,
          conclusion: articleData.conclusion,
          authorId: articleData.authorId,
          status: articleData.status,
          categories: {
            connect: articleData.categories.map((categoryId) => ({
              id: categoryId,
            })),
          },
          ArticleTag: {
            create: articleData.tags.map((tagId) => ({
              tag: {
                connect: { id: Number(tagId) },
              },
            })),
          },
        },
      });

      if (mediaUrls && mediaUrls.length > 0) {
        for (const imageUrl of mediaUrls) {
          await this.prisma.articleMedia.create({
            data: {
              articleId: article.id,

              imageUrl,
            },
          });
        }
      }

      return article;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create article.');
    }
  }
  async getArticle(articleId: string, userId?: number) {
    try {
      const article = await this.prisma.article.findUnique({
        where: { id: parseInt(articleId) },
        include: {
          ArticleMedia: true,
          author: true,
          ArticleTag: {
            include: { tag: true },
          },
          categories: {
            include: { category: true },
          },
          ArticleView: true,
          ArticleRating: true,
        },
      });

      if (!article) {
        throw new NotFoundException(`Article with ID ${articleId} not found.`);
      }
      await this.incrementArticleViews(parseInt(articleId), userId);

      const mediaUrls =
        article.ArticleMedia?.map((media) => media.imageUrl) || [];
      const tags =
        article.ArticleTag?.map((tagRelation) => tagRelation.tag.name) || [];
      const categories =
        article.categories?.map((catRelation) => catRelation.category.name) ||
        [];
      let finalUser = {
        id: article.id,
        title: article.title,
        subtitle: article.subtitle,
        content: article.content,
        isActive: article.isActive,
        conclusion: article.conclusion,
        publishDate: article.publishDate,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        status: article.status,
        views: article.views,
        mediaUrls,
        tags,
        categories,
        author: {
          photo_url: article.author?.photo_url || null,
          username: article.author?.username || null,
          name: `${article.author?.firstName || ''} ${article.author?.lastName || ''}`.trim(),
        },
        avgRating:
          article.ArticleRating.reduce(
            (total, rating) => total + rating.rating,
            0,
          ) / article.ArticleRating.length,
      };
      return finalUser;
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

      await this.prisma.articleMedia.deleteMany({
        where: {
          articleId: parseInt(articleId),
        },
      });

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
  async rateArticle(articleId: number, userId: number, rating: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.articleRating.upsert({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
      update: {
        rating,
      },
      create: {
        userId,
        articleId,
        rating,
      },
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
        averageRating: averageRating,
        totalRatings: totalRatings,
      },
    });

    return { averageRating, totalRatings };
  }
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
    let averageRating = ratings.reduce(
      (total, rating) => total + rating.rating,
      0,
    );
    return {
      averageRating: averageRating / ratings.length,
      ratings,
    };
  }

  async getTopArticles(limit: number) {
    try {
      // Ensure the limit is a valid number
      const takeLimit = Number(limit);
      if (isNaN(takeLimit) || takeLimit <= 0) {
        throw new BadRequestException('Invalid limit parameter');
      }

      // Use findMany to get the top articles
      return await this.prisma.article.findMany({
        take: takeLimit, // Fetch top articles based on the limit
        orderBy: {
          views: 'desc', // Order articles by the number of views (or other criteria)
        },
        include: {
          author: true,
          ArticleTag: {
            include: { tag: true },
          },
          categories: {
            include: { category: true },
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch top articles');
    }
  }
}
