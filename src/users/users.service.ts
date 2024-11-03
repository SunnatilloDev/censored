import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from 'src/users/dto/index';
import { UploadService } from 'src/upload/upload.service'; // Import the UploadService

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService, // Inject UploadService
  ) {}

  async getOneById(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        ...user,
        telegramId: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve user.');
    }
  }

  async updateOne(id: number, body: UpdateUserDto, file?: Express.Multer.File) {
    try {
      let photoUrl: string | undefined;

      // Handle photo upload if file is provided
      if (file) {
        const filePath = await this.uploadService.saveFile(file);
        photoUrl = filePath;
      }

      return await this.prisma.user.update({
        where: { id },
        data: {
          ...body,
          photo_url: photoUrl || body.photo_url, // Update photo URL if a new file is uploaded
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw new InternalServerErrorException('Failed to update user.');
    }
  }

  async checkSubscription(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user.isSubscribed;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to check subscription status.',
      );
    }
  }
}
