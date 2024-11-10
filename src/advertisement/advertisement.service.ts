import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdvertisementDto, UpdateAdvertisementDto } from './dto';

@Injectable()
export class AdvertisementService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new advertisement
  async createAdvertisement(adData: CreateAdvertisementDto) {
    try {
      return await this.prisma.advertisement.create({
        data: {
          imageUrl: adData.imageUrl,
          redirectUrl: adData.redirectUrl,
          startDate: new Date(adData.startDate),
          endDate: new Date(adData.endDate),
          isActive: adData.isActive ?? true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to create advertisement.');
    }
  }

  // Update advertisement details
  async updateAdvertisement(adId: number, updateData: UpdateAdvertisementDto) {
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
          ...updateData,
          startDate: updateData.startDate
            ? new Date(updateData.startDate)
            : undefined,
          endDate: updateData.endDate
            ? new Date(updateData.endDate)
            : undefined,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to update advertisement.');
    }
  }

  // Retrieve a single advertisement by ID
  async getAdvertisement(adId: number) {
    const advertisement = await this.prisma.advertisement.findUnique({
      where: { id: adId },
    });

    if (!advertisement) {
      throw new NotFoundException(`Advertisement with ID ${adId} not found.`);
    }
    return advertisement;
  }

  // List all advertisements
  async getAllAdvertisements() {
    try {
      return await this.prisma.advertisement.findMany();
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve advertisements.',
      );
    }
  }

  // Delete advertisement
  async deleteAdvertisement(adId: number) {
    try {
      const adExists = await this.prisma.advertisement.findUnique({
        where: { id: adId },
      });

      if (!adExists) {
        throw new NotFoundException(`Advertisement with ID ${adId} not found.`);
      }

      await this.prisma.advertisement.delete({
        where: { id: adId },
      });

      return { message: 'Advertisement deleted successfully.' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete advertisement.');
    }
  }

  // Track clicks or impressions
  async trackAdPerformance(adId: number, type: 'click' | 'impression') {
    const advertisement = await this.prisma.advertisement.findUnique({
      where: { id: adId },
    });

    if (!advertisement) {
      throw new NotFoundException(`Advertisement with ID ${adId} not found.`);
    }

    const fieldToUpdate = type === 'click' ? 'clicks' : 'impressions';

    return this.prisma.advertisement.update({
      where: { id: adId },
      data: { [fieldToUpdate]: { increment: 1 } },
    });
  }
}
