import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkAllSubscriptions() {
    this.logger.log('Starting subscription check for all users...');

    try {
      // Get all users with telegramId
      const users = await this.prisma.user.findMany({
        where: {
          telegramId: {
            not: null
          }
        },
        select: {
          id: true,
          telegramId: true,
          isSubscribed: true
        }
      });

      this.logger.log(`Found ${users.length} users to check`);

      for (const user of users) {
        try {
          const isSubscribed = await this.checkTelegramSubscription(Number(user.telegramId));
          
          // Only update if subscription status has changed
          if (isSubscribed !== user.isSubscribed) {
            await this.prisma.user.update({
              where: { id: user.id },
              data: { isSubscribed }
            });

            this.logger.log(`Updated subscription status for user ${user.id}: ${isSubscribed}`);
          }
        } catch (error) {
          this.logger.error(`Error checking subscription for user ${user.id}:`, error.message);
        }
      }

      this.logger.log('Finished subscription check for all users');
    } catch (error) {
      this.logger.error('Error in subscription check cron job:', error.message);
    }
  }

  private async checkTelegramSubscription(telegramId: number): Promise<boolean> {
    if (!telegramId) {
      return false;
    }

    try {
      const response = await axios.post(
        'https://api.telegram.org/bot' +
          process.env.TELEGRAM_BOT_TOKEN +
          '/getChatMember',
        {
          chat_id: process.env.TELEGRAM_CHAT_ID,
          user_id: telegramId,
        },
        {
          timeout: 5000, // 5 second timeout
        },
      );

      const { status } = response.data.result;
      return ['creator', 'administrator', 'member'].includes(status);
    } catch (error) {
      this.logger.error(`Telegram API error for user ${telegramId}:`, error.message);
      return false;
    }
  }
}
