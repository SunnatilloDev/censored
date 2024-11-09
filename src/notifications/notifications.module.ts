import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [NotificationsService, PrismaService],
  exports: [NotificationsService], // Export the service to use in other modules
})
export class NotificationsModule {}
