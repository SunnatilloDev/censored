import { Module } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { ReferralController } from './referral.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [ReferralService, PrismaService],
  controllers: [ReferralController],
})
export class ReferralModule {}
