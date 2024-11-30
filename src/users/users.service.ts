import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto';
import { UploadService } from 'src/upload/upload.service'; // Import the UploadService

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService, // Inject UploadService
  ) {}

  async getAll() {
    try {
      return await this.prisma.user.findMany({
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          photo_url: true,
          role: true,
          status: true,
          lastOnline: true,
          isBlocked: true,
          isSubscribed: true,
          about: true,
          profileHeader: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async getOneById(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          photo_url: true,
          role: true,
          status: true,
          lastOnline: true,
          isBlocked: true,
          isSubscribed: true,
          about: true,
          profileHeader: true,
          createdAt: true,
          _count: {
            select: {
              articles: true,
              ArticleRating: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        ...user,
        articlesCount: user._count.articles,
        ratingsCount: user._count.ArticleRating,
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async updateOne(id: number, body: UpdateUserDto, file?: Express.Multer.File) {
    try {
      // First check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: { id: true, photo_url: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      let photoUrl = body.photo_url;

      if (file) {
        try {
          // Upload new photo
          const uploadResult = await this.uploadService.processUploadedFile(file);
          photoUrl = uploadResult.path;
          
          // Delete old photo if it exists and is different
          if (user.photo_url && user.photo_url !== photoUrl) {
            await this.uploadService.deleteFile(user.photo_url);
          }
        } catch (error) {
          console.error('Error handling file upload:', error);
          throw new InternalServerErrorException('Failed to upload profile photo');
        }
      }

      // Validate about and profileHeader length
      if (body.about && body.about.length > 500) {
        throw new Error('About text cannot exceed 500 characters');
      }
      if (body.profileHeader && body.profileHeader.length > 100) {
        throw new Error('Profile header cannot exceed 100 characters');
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          ...body,
          photo_url: photoUrl,
          lastOnline: new Date(), // Update last online time
        },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          photo_url: true,
          role: true,
          status: true,
          lastOnline: true,
          isBlocked: true,
          isSubscribed: true,
          about: true,
          profileHeader: true,
          createdAt: true,
        },
      });

      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.message.includes('cannot exceed')) {
        throw new Error(error.message);
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async checkSubscription(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: { isSubscribed: true, isBlocked: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.isBlocked) {
        return false;
      }

      return user.isSubscribed;
    } catch (error) {
      console.error('Error checking subscription:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to check subscription status');
    }
  }

  async blockUser(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: { id: true, role: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.role === 'OWNER' || user.role === 'ADMIN') {
        throw new Error('Cannot block administrators');
      }

      await this.prisma.user.update({
        where: { id },
        data: { isBlocked: true },
      });

      return { message: 'User blocked successfully' };
    } catch (error) {
      console.error('Error blocking user:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.message === 'Cannot block administrators') {
        throw new Error(error.message);
      }
      throw new InternalServerErrorException('Failed to block user');
    }
  }

  async unblockUser(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.prisma.user.update({
        where: { id },
        data: { isBlocked: false },
      });

      return { message: 'User unblocked successfully' };
    } catch (error) {
      console.error('Error unblocking user:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to unblock user');
    }
  }
}
