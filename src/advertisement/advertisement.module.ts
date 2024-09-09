import { Module } from '@nestjs/common';
import { AdvertisementService } from './advertisement.service';
import { AdvertisementController } from './advertisement.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [AdvertisementService, PrismaService],
  controllers: [AdvertisementController],
})
export class AdvertisementModule {}
