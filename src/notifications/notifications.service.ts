// src/notifications/notifications.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import * as cron from 'node-cron';
import { Notification } from '@prisma/client'; // Import Notification model type
import bot from 'src/bot/bot';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {
    this.scheduleNotifications(); // Start the cron job on service instantiation
  }

  async scheduleNotification(createNotificationDto: CreateNotificationDto) {
    const { type, endDate, recipientRoles, message } = createNotificationDto;
    const notification = await this.prisma.notification.create({
      data: {
        type,
        endDate,
        recipientRole: recipientRoles,
        message,
      },
    });
    return { message: 'Notification scheduled successfully', notification };
  }

  // Schedule a cron job to run every minute and check for due notifications
  private scheduleNotifications() {
    cron.schedule('*/5 * * * *', async () => {
      await this.sendDueNotifications();
    });
  }

  // Check and send notifications that are due
  private async sendDueNotifications() {
    const now = new Date();
    const dueNotifications = await this.prisma.notification.findMany({
      where: {
        endDate: { lte: now },
      },
    });

    for (const notification of dueNotifications) {
      try {
        await this.sendNotificationToRoles(notification);
        // Optionally mark as sent if needed
      } catch (error) {
        console.error(
          `Error sending notification ID ${notification.id}:`,
          error,
        );
      }
    }
  }

  // Send notifications to all users with specified roles
  private async sendNotificationToRoles(notification: Notification) {
    const { recipientRole, message } = notification;

    for (const role of recipientRole) {
      // Fetch users by role
      const users = await this.prisma.user.findMany({
        where: { role },
      });

      for (const user of users) {
        try {
          await this.sendTelegramNotification(user.telegramId, message);
        } catch (error) {
          console.error(`Failed to notify user ${user.telegramId}:`, error);
          throw new InternalServerErrorException(
            `Failed to notify user with Telegram ID ${user.telegramId}.`,
          );
        }
      }
    }
  }

  // Helper function to send a message via Telegram
  async sendTelegramNotification(
    telegramId: string,
    message: string,
  ): Promise<void> {
    try {
      await bot.api.sendMessage(telegramId, message);
    } catch (error) {
      console.error(`Telegram API Error for ${telegramId}:`, error);
      throw new InternalServerErrorException(
        `Failed to send notification via Telegram.`,
      );
    }
  }
}
