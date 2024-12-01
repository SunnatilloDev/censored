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
  private readonly isProduction: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.botToken = this.configService.get<string>('telegram.botToken');
    this.chatId = this.configService.get<string>('telegram.chatId');
    this.isProduction =
      this.configService.get<string>('server.env') === 'production';

    if (this.isProduction && (!this.botToken || !this.chatId)) {
      throw new Error('Telegram credentials are required in production mode');
    }

    if (!this.botToken || !this.chatId) {
      this.logger.warn(
        'Telegram credentials not configured - subscription checks will be skipped',
      );
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkAllSubscriptions() {
    // Skip subscription check if Telegram is not configured
    if (!this.botToken || !this.chatId) {
      this.logger.debug(
        'Skipping subscription check - Telegram not configured',
      );
      return;
    }

    this.logger.log('Starting subscription check for all users...');

    try {
      // Get all users with telegramId
      const users = await this.prisma.user
        .findMany({
          where: {
            AND: [
              { telegramId: { not: '' } }, // Exclude empty strings
              { telegramId: { not: null } }, // Exclude null values
            ],
          },
          select: {
            id: true,
            telegramId: true,
            isSubscribed: true,
            username: true, // For better logging
          },
        })
        .catch((error) => {
          throw new DatabaseException(
            `Failed to fetch users: ${error.message}`,
          );
        });

      this.logger.log(`Found ${users.length} users to check`);

      const results = {
        success: 0,
        failed: 0,
        unchanged: 0,
        errors: [] as string[],
      };

      for (const user of users) {
        try {
          this.logger.debug(
            `Checking subscription for user ${user.username || user.id}`,
          );
          const isSubscribed = await this.checkTelegramSubscription(
            user.telegramId,
          );
          this.logger.debug(
            `User ${user.username || user.id} subscription status: ${isSubscribed}, current DB status: ${user.isSubscribed}`,
          );

          // Only update if subscription status has changed
          if (isSubscribed !== user.isSubscribed) {
            this.logger.debug(
              `Updating subscription status for user ${user.username || user.id} from ${user.isSubscribed} to ${isSubscribed}`,
            );

            const updatedUser = await this.prisma.user
              .update({
                where: { id: user.id },
                data: { isSubscribed },
              })
              .catch((error) => {
                this.logger.error(
                  `Failed to update user ${user.id}: ${error.message}`,
                );
                throw new DatabaseException(
                  `Failed to update user ${user.id}: ${error.message}`,
                );
              });

            this.logger.log(
              `Successfully updated subscription status for user ${user.username || user.id}: ${isSubscribed}, DB status now: ${updatedUser.isSubscribed}`,
            );
            results.success++;
          } else {
            this.logger.debug(
              `No change needed for user ${user.username || user.id}, status remains: ${user.isSubscribed}`,
            );
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
        errors: results.errors.length
          ? `${results.errors.length} errors occurred`
          : 'No errors',
      });
      console.log('Subscription check summary:', {
        total: users.length,
        ...results,
        errors: results.errors.length
          ? `${results.errors.length} errors occurred`
          : 'No errors',
      });
    } catch (error) {
      this.logger.error(
        'Critical error in subscription check cron job:',
        error,
      );
      throw error; // Let the global exception filter handle it
    }
  }

  private async checkTelegramSubscription(
    telegramId: string,
  ): Promise<boolean> {
    if (!telegramId || !this.botToken || !this.chatId) {
      this.logger.warn('Missing required Telegram configuration');
      return false;
    }

    try {
      this.logger.debug(`Making Telegram API request for user ${telegramId}`);
      const response = await axios.post(
        `https://api.telegram.org/bot${this.botToken}/getChatMember`,
        {
          chat_id: this.chatId,
          user_id: telegramId,
        },
        {
          timeout: 5000, // 5 second timeout
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.data?.ok) {
        this.logger.warn(
          `Telegram API returned not OK status for user ${telegramId}`,
        );
        throw new TelegramAPIException('Telegram API returned not OK status');
      }

      const { status } = response.data.result;
      this.logger.debug(
        `Telegram API returned status "${status}" for user ${telegramId}`,
      );
      const isSubscribed = ['creator', 'administrator', 'member'].includes(
        status,
      );
      this.logger.debug(
        `User ${telegramId} subscription status determined as: ${isSubscribed}`,
      );
      return isSubscribed;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.code === 'ECONNABORTED') {
          this.logger.error(`Telegram API timeout for user ${telegramId}`);
          throw new TelegramAPIException('Telegram API timeout');
        }
        if (error.response?.status === 429) {
          this.logger.error(`Rate limit exceeded for user ${telegramId}`);
          throw new TelegramAPIException('Rate limit exceeded');
        }
        const apiError = error.response?.data?.description || error.message;
        this.logger.error(
          `Telegram API error for user ${telegramId}: ${apiError}`,
        );
        throw new TelegramAPIException(`Telegram API error: ${apiError}`);
      }

      this.logger.error(
        `Failed to verify subscription for user ${telegramId}: ${error.message}`,
      );
      throw new TelegramAPIException(
        `Failed to verify subscription: ${error.message}`,
      );
    }
  }
}
