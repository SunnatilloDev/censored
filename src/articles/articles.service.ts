import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto, UpdateArticleDto } from './dto';
import transformArticleData from 'src/articles/utils/rowToNiceStructure';
import { ArticleStatus } from '@prisma/client'; // Import the enum
import { Role } from '@prisma/client'; // Import the enum

@Injectable()
export class ArticlesService {
  private readonly maxTitleLength = 200;
  private readonly maxContentLength = 50000;
  private readonly maxConclusionLength = 2000;
  private readonly maxTagsPerArticle = 10;
  private readonly maxCategoriesPerArticle = 5;
  private readonly ratingDelay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  constructor(private prisma: PrismaService) {}

  // Get all articles
  async getAllArticles(userId?: number) {
    try {
      console.log('getAllArticles called with userId:', userId);

      // First get the user's role if userId is provided
      let userRole = null;
      if (userId) {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });
        console.log('Found user with role:', user?.role);
        userRole = user?.role;
      }

      // Build the where clause based on user role
      const whereClause = {
        isActive: true,
        ...(!userRole ||
        (userRole !== Role.OWNER &&
          userRole !== Role.ADMIN &&
          userRole !== Role.MODERATOR)
          ? { status: ArticleStatus.PUBLISHED }
          : {}), // No status filter for privileged users
      };

      console.log('Using where clause:', whereClause);

      const articles = await this.prisma.article.findMany({
        where: whereClause,
        include: {
          ArticleRating: true,
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              photo_url: true,
              isBlocked: true,
            },
          },
          ArticleTag: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: [
          { isEditorChoice: 'desc' },
          { avgRating: 'desc' },
          { createdAt: 'desc' },
        ],
      });

      console.log('Found articles count:', articles.length);
      return articles.map((article) => transformArticleData(article));
    } catch (err) {
      console.error('Error in getAllArticles:', err);
      // Add more detailed error information
      if (err instanceof Error) {
        throw new InternalServerErrorException(
          `Failed to fetch articles: ${err.message}`,
        );
      }
      throw new InternalServerErrorException('Failed to fetch articles');
    }
  }

  // Increment article views with rate limiting
  async incrementArticleViews(articleId: number, userId?: number) {
    if (!userId) return;

    try {
      const [isValidUser, hasViewed] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, isBlocked: true },
        }),
        this.prisma.articleView.findUnique({
          where: { userId_articleId: { userId, articleId } },
        }),
      ]);

      if (isValidUser?.isBlocked) {
        return;
      }

      if (!hasViewed && isValidUser) {
        await this.prisma.$transaction([
          this.prisma.article.update({
            where: {
              id: articleId,
              isActive: true,
            },
            data: { views: { increment: 1 } },
          }),
          this.prisma.articleView.create({
            data: {
              userId,
              articleId,
            },
          }),
        ]);
      }
    } catch (error) {
      console.error('Error incrementing article views:', error);
    }
  }

  async createArticle(articleData: CreateArticleDto) {
    try {
      // Validate input lengths
      if (articleData.title.length > this.maxTitleLength) {
        throw new BadRequestException(
          `Title cannot be longer than ${this.maxTitleLength} characters`,
        );
      }
      if (articleData.content.length > this.maxContentLength) {
        throw new BadRequestException(
          `Content cannot exceed ${this.maxContentLength} characters`,
        );
      }
      if (
        articleData.conclusion &&
        articleData.conclusion.length > this.maxConclusionLength
      ) {
        throw new BadRequestException(
          `Conclusion cannot exceed ${this.maxConclusionLength} characters`,
        );
      }
      if (
        articleData.tags &&
        articleData.tags.length > this.maxTagsPerArticle
      ) {
        throw new BadRequestException(
          `Cannot have more than ${this.maxTagsPerArticle} tags`,
        );
      }
      if (
        articleData.categories &&
        articleData.categories.length > this.maxCategoriesPerArticle
      ) {
        throw new BadRequestException(
          `Cannot have more than ${this.maxCategoriesPerArticle} categories`,
        );
      }

      // Check if the author exists and is not blocked
      const author = await this.prisma.user.findUnique({
        where: { id: articleData.authorId },
        select: {
          id: true,
          isBlocked: true,
          role: true,
          isSubscribed: true,
          telegramId: true,
        },
      });

      if (!author) {
        throw new BadRequestException('Invalid author ID');
      }

      if (author.isBlocked) {
        throw new BadRequestException('Blocked users cannot create articles');
      }

      // Check subscription status for non-admin users
      if (author.role !== 'OWNER' && author.role !== 'ADMIN') {
        if (!author.isSubscribed) {
          throw new BadRequestException(
            'You must be subscribed to the channel to create articles. Please subscribe and try again.',
          );
        }
      }

      // Validate categories
      if (articleData.categories?.length) {
        const categories = await this.prisma.category.findMany({
          where: { id: { in: articleData.categories } },
          select: { id: true },
        });

        if (categories.length !== articleData.categories.length) {
          throw new BadRequestException('One or more categories are invalid');
        }
      }

      // Create the article in a transaction
      return await this.prisma.$transaction(async (tx) => {
        // Create the article
        const article = await tx.article.create({
          data: {
            title: articleData.title.trim(),
            subtitle: articleData.subtitle?.trim(),
            content: articleData.content,
            conclusion: articleData.conclusion?.trim(),
            poster: articleData.poster,
            author: { connect: { id: articleData.authorId } },
            status:
              author.role === 'ADMIN'
                ? ArticleStatus.PUBLISHED
                : ArticleStatus.MODERATED,
            categories: articleData.categories
              ? {
                  create: articleData.categories.map((categoryId) => ({
                    category: { connect: { id: categoryId } },
                  })),
                }
              : undefined,
            tags: articleData.tags?.join(','),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          include: {
            categories: {
              include: {
                category: true,
              },
            },
            author: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                photo_url: true,
              },
            },
          },
        });

        return transformArticleData(article);
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error in createArticle:', error);
      throw new InternalServerErrorException('Failed to create article');
    }
  }

  async getArticlesByStatus(status: string | ArticleStatus) {
    return this.prisma.article.findMany({
      where: { status: status as ArticleStatus },
    });
  }

  async publishArticle(articleId: number) {
    const article = await this.prisma.article.update({
      where: { id: articleId },
      data: { status: 'PUBLISHED' }, // Change status to PUBLISHED
    });
    return article;
  }

    /**
     * Searches for articles based on a given query and pagination parameters.
     * 
     * @param query - The search string to match against articles.
     * @param page - The page number for pagination (default is 1).
     * @param limit - The number of articles to return per page (default is 10).
     * @param userId - Optional user ID to filter articles based on user role.
     * @throws BadRequestException if the search query is empty.
     * @throws InternalServerErrorException if the search operation fails.
     * @returns An object containing the list of articles and pagination metadata.
     */
  async searchArticles(query: string, page = 1, limit = 10, userId?: number) {
    try {
      if (!query || query.trim().length === 0) {
        throw new BadRequestException('Search query cannot be empty');
      }

      // First get the user's role if userId is provided
      let userRole = null;
      if (userId) {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });
        userRole = user?.role;
      }

      const skip = (page - 1) * limit;
      const searchQuery = query.trim();

      // Build the where clause based on user role
      const whereClause = {
        AND: [
          { isActive: true },
          ...(!userRole ||
          (userRole !== Role.OWNER &&
            userRole !== Role.ADMIN &&
            userRole !== Role.MODERATOR)
            ? [{ status: ArticleStatus.PUBLISHED }]
            : []),
          {
            OR: [
              {
                title: {
                  contains: searchQuery,
                  mode: 'insensitive' as const,
                },
              },
              {
                subtitle: {
                  contains: searchQuery,
                  mode: 'insensitive' as const,
                },
              },
              {
                conclusion: {
                  contains: searchQuery,
                  mode: 'insensitive' as const,
                },
              },
              {
                ArticleTag: {
                  some: {
                    tag: {
                      name: {
                        contains: searchQuery,
                        mode: 'insensitive' as const,
                      },
                    },
                  },
                },
              },
              {
                categories: {
                  some: {
                    category: {
                      name: {
                        contains: searchQuery,
                        mode: 'insensitive' as const,
                      },
                    },
                  },
                },
              },
            ],
          },
        ],
      };

      const [articles, total] = await Promise.all([
        this.prisma.article.findMany({
          where: whereClause,
          include: {
            ArticleRating: true,
            ArticleTag: {
              include: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            author: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                photo_url: true,
                isBlocked: true,
              },
            },
            categories: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: [
            { isEditorChoice: 'desc' },
            { avgRating: 'desc' },
            { createdAt: 'desc' },
          ],
          skip,
          take: limit,
        }),
        this.prisma.article.count({
          where: whereClause,
        }),
      ]);

      return {
        articles: articles.map((article) => transformArticleData(article)),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error searching articles:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to search articles');
    }
  }

  async getArticle(articleId: string, userId?: number) {
    console.log('getArticle invoked with articleId:', articleId);
    try {
      const id = parseInt(articleId);
      if (isNaN(id)) throw new BadRequestException('Invalid article ID');

      // First get the user's role if userId is provided
      let userRole = null;
      if (userId) {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });
        userRole = user?.role;
      }

      // Fetch the article along with categories, author, and ratings
      const article = await this.prisma.article.findUnique({
        where: { id },
        include: {
          author: true,
          categories: { include: { category: true } },
          ArticleView: true,
          ArticleRating: true,
        },
      });

      if (!article) {
        throw new NotFoundException(`Article with ID ${articleId} not found.`);
      }

      // Check if article is published or user has special role
      if (
        article.status !== ArticleStatus.PUBLISHED &&
        (!userRole ||
          (userRole !== Role.OWNER &&
            userRole !== Role.ADMIN &&
            userRole !== Role.MODERATOR))
      ) {
        throw new ForbiddenException('This article is not published');
      }

      console.log('Article fetched:', article);

      // Increment views
      await this.incrementArticleViews(id, userId);

      // Process categories
      const categories =
        article.categories?.map((catRelation) => catRelation.category.name) ||
        [];

      // Calculate average rating
      const avgRating =
        article.ArticleRating.reduce(
          (total, rating) => total + rating.rating,
          0,
        ) / article.ArticleRating.length;

      // Return the transformed article data
      return {
        ...transformArticleData(article),
        tags: article.tags?.split(',') || [], // Convert the string back to an array
        categories,
        avgRating: avgRating || 0,
      };
    } catch (error) {
      console.error('Error in getArticle:', error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve article.');
    }
  }

  // Update an article
  async updateArticle(articleId: string, updateData: UpdateArticleDto) {
    try {
      const id = parseInt(articleId);
      const articleExists = await this.prisma.article.findUnique({
        where: { id },
      });

      if (!articleExists) {
        throw new NotFoundException(`Article with ID ${articleId} not found.`);
      }

      // Save the current version before updating
      await this.saveArticleVersion(id);

      // Update the article
      return await this.prisma.article.update({
        where: { id },
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
          tags: updateData.tags?.join(','), // Convert the tags array into a comma-separated string
        },
      });
    } catch (error) {
      console.error('Error in updateArticle:', error);
      throw new InternalServerErrorException('Failed to update article.');
    }
  }

  async deleteArticle(articleId: string) {
    try {
      const id = parseInt(articleId);
      const articleExists = await this.prisma.article.findUnique({
        where: { id },
      });

      if (!articleExists) {
        throw new NotFoundException(`Article with ID ${articleId} not found.`);
      }

      // Delete all related records in a transaction
      await this.prisma.$transaction([
        // Delete article ratings
        this.prisma.articleRating.deleteMany({
          where: { articleId: id },
        }),
        // Delete article media
        this.prisma.articleMedia.deleteMany({
          where: { articleId: id },
        }),
        // Delete article categories
        this.prisma.articleCategory.deleteMany({
          where: { articleId: id },
        }),
        // Delete article tags
        this.prisma.articleTag.deleteMany({
          where: { articleId: id },
        }),
        // Delete article views
        this.prisma.articleView.deleteMany({
          where: { articleId: id },
        }),
        // Delete article history
        this.prisma.articleHistory.deleteMany({
          where: { articleId: id },
        }),
        // Delete scam reports
        this.prisma.scamReport.deleteMany({
          where: { articleId: id },
        }),
        // Finally delete the article
        this.prisma.article.delete({
          where: { id },
        }),
      ]);

      return { message: 'Article deleted successfully' };
    } catch (error) {
      console.error('Error deleting article:', error);
      throw new InternalServerErrorException('Failed to delete article.');
    }
  }

  async rateArticle(articleId: number, userId: number, rating: number) {
    try {
      if (rating < 1 || rating > 5) {
        throw new BadRequestException('Rating must be between 1 and 5');
      }

      // Check if user and article exist in a single transaction
      const [user, article, existingRating] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, isBlocked: true },
        }),
        this.prisma.article.findUnique({
          where: {
            id: articleId,
            isActive: true,
          },
          select: {
            id: true,
            authorId: true,
            status: true,
          },
        }),
        this.prisma.articleRating.findUnique({
          where: { userId_articleId: { userId, articleId } },
          select: { createdAt: true },
        }),
      ]);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.isBlocked) {
        throw new BadRequestException('Blocked users cannot rate articles');
      }

      if (!article) {
        throw new NotFoundException('Article not found');
      }

      if (article.status !== ArticleStatus.PUBLISHED) {
        throw new BadRequestException('Can only rate published articles');
      }

      // Don't allow authors to rate their own articles
      if (article.authorId === userId) {
        throw new BadRequestException('Authors cannot rate their own articles');
      }

      // Check rating delay
      if (existingRating) {
        const timeSinceLastRating =
          Date.now() - existingRating.createdAt.getTime();
        if (timeSinceLastRating < this.ratingDelay) {
          const hoursLeft = Math.ceil(
            (this.ratingDelay - timeSinceLastRating) / (1000 * 60 * 60),
          );
          throw new BadRequestException(
            `You can rate this article again in ${hoursLeft} hours`,
          );
        }
      }

      // Update or create rating in a transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Create or update the rating
        await tx.articleRating.upsert({
          where: { userId_articleId: { userId, articleId } },
          update: {
            rating,
            createdAt: new Date(),
          },
          create: {
            userId,
            articleId,
            rating,
            createdAt: new Date(),
          },
        });

        // Calculate new rating statistics
        const stats = await tx.articleRating.aggregate({
          where: { articleId },
          _avg: { rating: true },
          _count: { rating: true },
          _max: { rating: true },
          _min: { rating: true },
        });

        // Update article with new statistics
        await tx.article.update({
          where: { id: articleId },
          data: {
            avgRating: stats._avg.rating || 0,
            totalRatings: stats._count.rating,
            updatedAt: new Date(),
          },
        });

        return {
          averageRating: stats._avg.rating || 0,
          totalRatings: stats._count.rating,
          maxRating: stats._max.rating || 0,
          minRating: stats._min.rating || 0,
        };
      });

      return result;
    } catch (error) {
      console.error('Error rating article:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to rate article');
    }
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
        name: `${article.author.firstName ?? ''} ${
          article.author.lastName ?? ''
        }`.trim(),
      },
    }));
    const averageRating =
      ratings.reduce((total, rating) => total + rating.rating, 0) /
      ratings.length;

    return { averageRating, ratings };
  }

  async getTopArticles(limit: number, latest: boolean) {
    try {
      const takeLimit = Number(limit);
      if (isNaN(takeLimit) || takeLimit <= 0) {
        throw new BadRequestException('Invalid limit parameter');
      }

      const orderBy: any[] = [
        { views: 'desc' as const },
        { avgRating: 'desc' as const },
      ];

      if (latest) {
        orderBy.push({ createdAt: 'desc' as const });
      }

      const topArticles = await this.prisma.article.findMany({
        take: takeLimit,
        orderBy,
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
      const [article, existingReport] = await Promise.all([
        this.prisma.article.findUnique({
          where: { id: articleId },
        }),
        this.prisma.scamReport.findFirst({
          where: {
            articleId,
            reportedById,
          },
        }),
      ]);

      if (!article) {
        throw new NotFoundException(`Article with ID ${articleId} not found.`);
      }

      if (existingReport) {
        throw new BadRequestException('You have already reported this article');
      }

      if (!reason.trim()) {
        throw new BadRequestException('Reason cannot be empty');
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
      console.error('Error reporting scam:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to report scam.');
    }
  }

  async removeScamReport(reportId: number) {
    try {
      const report = await this.prisma.scamReport.findUnique({
        where: { id: reportId },
      });

      if (!report) {
        throw new NotFoundException(
          `Scam report with ID ${reportId} not found.`,
        );
      }

      // Delete the scam report
      await this.prisma.scamReport.delete({
        where: { id: reportId },
      });

      return { message: 'Scam report removed successfully' };
    } catch (error) {
      console.error('Error removing scam report:', error);
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
      console.error('Error fetching scam reports:', error);
      throw new InternalServerErrorException('Failed to fetch scam reports.');
    }
  }

  private async saveArticleVersion(articleId: number) {
    try {
      const article = await this.prisma.article.findUnique({
        where: { id: articleId },
        select: {
          title: true,
          subtitle: true,
          content: true,
          conclusion: true,
        },
      });

      if (!article) {
        throw new NotFoundException(`Article with ID ${articleId} not found`);
      }

      await this.prisma.articleHistory.create({
        data: {
          articleId,
          title: article.title,
          subtitle: article.subtitle,
          content: article.content,
          conclusion: article.conclusion,
        },
      });
    } catch (error) {
      console.error('Error saving article version:', error);
      throw new InternalServerErrorException('Failed to save article version');
    }
  }

  async restoreArticleVersion(articleId: number, versionId: number) {
    try {
      const version = await this.prisma.articleHistory.findUnique({
        where: { id: versionId },
      });

      if (!version) {
        throw new NotFoundException('Version not found');
      }

      const article = await this.prisma.article.findUnique({
        where: { id: articleId },
      });

      if (!article) {
        throw new NotFoundException('Article not found');
      }

      // Save current version before restoring old one
      await this.saveArticleVersion(articleId);

      return await this.prisma.article.update({
        where: { id: articleId },
        data: {
          title: version.title,
          subtitle: version.subtitle,
          content: version.content,
          conclusion: version.conclusion,
        },
      });
    } catch (error) {
      console.error('Error restoring article version:', error);
      throw new InternalServerErrorException(
        'Failed to restore article version',
      );
    }
  }
}
