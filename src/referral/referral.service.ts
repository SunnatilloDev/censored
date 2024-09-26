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

  // Create a referral
  async createReferral(referrerId: number, airdropId: number) {
    try {
      const referralLink = generateUniqueId({ length: 10 });

      return await this.prisma.referral.create({
        data: {
          referralLink,
          referrer: {
            connect: { id: referrerId },
          },
          airdrop: {
            connect: { id: airdropId },
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create referral.');
    }
  }

  // Track and update referral when the referred user joins
  async trackReferral(referralLink: string, referredId: number) {
    try {
      // Use findFirst instead of findUnique if referralLink is not unique
      const referral = await this.prisma.referral.findFirst({
        where: { referralLink },
      });

      if (!referral) {
        throw new NotFoundException('Invalid referral link.');
      }

      if (referral.referredId) {
        throw new BadRequestException('Referral link has already been used.');
      }

      // Use connect to link referredId to the User model
      return await this.prisma.referral.update({
        where: { referralLink },
        data: {
          referred: {
            connect: { id: referredId },
          },
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

  // Get all referrals made by a specific user
  async getUserReferrals(referrerId: number) {
    try {
      return await this.prisma.referral.findMany({
        where: { referrerId },
        include: {
          referred: true, // Include referred user data
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to get user referrals.');
    }
  }
}
