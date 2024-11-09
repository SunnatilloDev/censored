import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReferralDto, TrackReferralDto } from './dto';
import generateUniqueId from 'generate-unique-id';

@Injectable()
export class ReferralService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new referral link
  async createReferral(data: CreateReferralDto) {
    try {
      const referralLink = generateUniqueId({ length: 10 });
      const { userId, eventId } = data;

      return await this.prisma.referral.create({
        data: {
          referralLink,
          referrer: { connect: { id: userId } },
          airdrop: { connect: { id: eventId } }, // Linking to an event/airdrop
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create referral.');
    }
  }

  // Track referral usage by a referred user
  async trackReferral(referralLink: string, referredId: number) {
    try {
      const referral = await this.prisma.referral.findFirst({
        where: { referralLink },
      });

      if (!referral) throw new NotFoundException('Invalid referral link.');
      if (referral.referredId) throw new BadRequestException('Already used.');

      return await this.prisma.referral.update({
        where: { referralLink },
        data: { referred: { connect: { id: referredId } } },
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
        include: { referred: true }, // Include referred user data
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to get user referrals.');
    }
  }
}
