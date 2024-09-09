import { Injectable, InternalServerErrorException } from '@nestjs/common';
import bot from 'src/bot/bot';

@Injectable()
export class NotificationsService {
  async sendNotification(telegramId: string, message: string): Promise<void> {
    try {
      await bot.api.sendMessage(telegramId, message);
    } catch (error) {
      console.error(`Failed to send notification to ${telegramId}:`, error);
      throw new InternalServerErrorException(
        `Failed to send notification to user with Telegram ID ${telegramId}.`,
      );
    }
  }
}
