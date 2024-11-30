import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SubscriptionService } from './subscription.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [SubscriptionService, PrismaService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
