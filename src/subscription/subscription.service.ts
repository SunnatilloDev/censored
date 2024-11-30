import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import {
  TelegramAPIException,
  DatabaseException,
} from '../common/exceptions/custom.exceptions';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  private readonly botToken: string;
  private readonly chatId: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    this.chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkAllSubscriptions() {
    this.logger.log('Starting subscription check for all users...');

    try {
      // Get all users with telegramId
      const users = await this.prisma.user.findMany({
        where: {
          AND: [
            { telegramId: { not: '' } },  // Exclude empty strings
            { telegramId: { not: null } } // Exclude null values
          ]
        },
        select: {
          id: true,
          telegramId: true,
          isSubscribed: true,
          username: true  // For better logging
        }
      }).catch(error => {
        throw new DatabaseException(`Failed to fetch users: ${error.message}`);
      });

      this.logger.log(`Found ${users.length} users to check`);

      const results = {
        success: 0,
        failed: 0,
        unchanged: 0,
        errors: [] as string[]
      };

      for (const user of users) {
        try {
          const isSubscribed = await this.checkTelegramSubscription(user.telegramId);
          
          // Only update if subscription status has changed
          if (isSubscribed !== user.isSubscribed) {
            await this.prisma.user.update({
              where: { id: user.id },
              data: { isSubscribed }
            }).catch(error => {
              throw new DatabaseException(`Failed to update user ${user.id}: ${error.message}`);
            });

            this.logger.log(
              `Updated subscription status for user ${user.username || user.id}: ${isSubscribed}`
            );
            results.success++;
          } else {
            results.unchanged++;
          }
        } catch (error) {
          results.failed++;
          const errorMessage = `Error checking subscription for user ${user.username || user.id}: ${error.message}`;
          this.logger.error(errorMessage);
          results.errors.push(errorMessage);
        }
      }

      // Log summary
      this.logger.log('Subscription check summary:', {
        total: users.length,
        ...results,
        errors: results.errors.length ? `${results.errors.length} errors occurred` : 'No errors'
      });
    } catch (error) {
      this.logger.error('Critical error in subscription check cron job:', error);
      throw error; // Let the global exception filter handle it
    }
  }

  private async checkTelegramSubscription(telegramId: string): Promise<boolean> {
    if (!telegramId || !this.botToken || !this.chatId) {
      this.logger.warn('Missing required Telegram configuration');
      return false;
    }

    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${this.botToken}/getChatMember`,
        {
          chat_id: this.chatId,
          user_id: telegramId,
        },
        {
          timeout: 5000, // 5 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data?.ok) {
        throw new TelegramAPIException('Telegram API returned not OK status');
      }

      const { status } = response.data.result;
      return ['creator', 'administrator', 'member'].includes(status);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.code === 'ECONNABORTED') {
          throw new TelegramAPIException('Telegram API timeout');
        }
        if (error.response?.status === 429) {
          throw new TelegramAPIException('Rate limit exceeded');
        }
        const apiError = error.response?.data?.description || error.message;
        throw new TelegramAPIException(`Telegram API error: ${apiError}`);
      }
      
      throw new TelegramAPIException(
        `Failed to verify subscription: ${error.message}`
      );
    }
  }
}
