import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsController } from './notifications.controller';

@Module({
  providers: [NotificationsService, PrismaService],
  exports: [NotificationsService], // Export the service to use in other modules
  controllers: [NotificationsController],
})
export class NotificationsModule {}
