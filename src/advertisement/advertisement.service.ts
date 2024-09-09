import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdvertisementService {
  constructor(private readonly prisma: PrismaService) {}

  async createAdvertisement(adData: any) {
    try {
      if (!adData.imageUrl || !adData.redirectUrl) {
        throw new BadRequestException(
          'Image URL and Redirect URL are required.',
        );
      }

      return await this.prisma.advertisement.create({
        data: {
          imageUrl: adData.imageUrl,
          redirectUrl: adData.redirectUrl,
          isActive: adData.isActive ?? true,
          startDate: adData.startDate,
          endDate: adData.endDate,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create advertisement.');
    }
  }

  async updateAdvertisement(adId: number, updateData: any) {
    try {
      const adExists = await this.prisma.advertisement.findUnique({
        where: { id: adId },
      });

      if (!adExists) {
        throw new NotFoundException(`Advertisement with ID ${adId} not found.`);
      }

      return await this.prisma.advertisement.update({
        where: { id: adId },
        data: {
          imageUrl: updateData.imageUrl,
          redirectUrl: updateData.redirectUrl,
          isActive: updateData.isActive,
          startDate: updateData.startDate,
          endDate: updateData.endDate,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Already handled
      }
      throw new InternalServerErrorException('Failed to update advertisement.');
    }
  }

  async getAdvertisement(adId: number) {
    try {
      const advertisement = await this.prisma.advertisement.findUnique({
        where: { id: adId },
      });

      if (!advertisement) {
        throw new NotFoundException(`Advertisement with ID ${adId} not found.`);
      }

      return advertisement;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Already handled
      }
      throw new InternalServerErrorException(
        'Failed to retrieve advertisement.',
      );
    }
  }

  async trackAdPerformance(adId: number, type: 'click' | 'impression') {
    try {
      const advertisement = await this.prisma.advertisement.findUnique({
        where: { id: adId },
      });

      if (!advertisement) {
        throw new NotFoundException(`Advertisement with ID ${adId} not found.`);
      }

      if (type === 'click') {
        return await this.prisma.advertisement.update({
          where: { id: adId },
          data: {
            clicks: {
              increment: 1,
            },
          },
        });
      } else if (type === 'impression') {
        return await this.prisma.advertisement.update({
          where: { id: adId },
          data: {
            impressions: {
              increment: 1,
            },
          },
        });
      } else {
        throw new BadRequestException(
          'Invalid performance type. It should be either "click" or "impression".',
        );
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error; // Already handled
      }
      throw new InternalServerErrorException(
        'Failed to track advertisement performance.',
      );
    }
  }
}
