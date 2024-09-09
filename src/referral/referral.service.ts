import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import generateUniqueId from 'generate-unique-id';

@Injectable()
export class ReferralService {
  constructor(private readonly prisma: PrismaService) {}

  async createReferral(referrerId: number) {
    try {
      const referralLink = generateUniqueId({ length: 10 });

      return await this.prisma.referral.create({
        data: {
          referralLink,
          referrerId,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create referral.');
    }
  }

  async trackReferral(referralLink: string, referredId: number) {
    try {
      const referral = await this.prisma.referral.findUnique({
        where: { referralLink },
      });

      if (!referral) {
        throw new NotFoundException('Invalid referral link.');
      }

      if (referral.referredId) {
        throw new BadRequestException('Referral link has already been used.');
      }

      return await this.prisma.referral.update({
        where: { referralLink },
        data: {
          referredId,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to track referral.');
    }
  }

  async getUserReferrals(referrerId: number) {
    try {
      return await this.prisma.referral.findMany({
        where: { referrerId },
        include: {
          referred: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to get user referrals.');
    }
  }
}
