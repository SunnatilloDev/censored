import { Injectable, InternalServerErrorException } from '@nestjs/common';
import bot from 'src/bot/bot';

@Injectable()
export class NotificationsService {
  // Send a notification based on the channel (currently only Telegram)
  async sendNotification(
    telegramId: string,
    message: string,
    channel: 'telegram' = 'telegram',
  ): Promise<void> {
    try {
      if (channel === 'telegram') {
        await this.sendTelegramNotification(telegramId, message);
      } else {
        throw new Error('Unsupported notification channel');
      }
    } catch (error) {
      console.error(`Failed to send notification to ${telegramId}:`, error);
      throw new InternalServerErrorException(
        `Failed to send notification to user with Telegram ID ${telegramId}.`,
      );
    }
  }

  // Function to handle sending messages via Telegram
  private async sendTelegramNotification(
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
