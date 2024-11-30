import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { TelegramAPIException } from '../common/exceptions/custom.exceptions';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken: string;
  private readonly channelId: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
    this.channelId = process.env.TELEGRAM_CHANNEL_ID;

    if (!this.botToken || !this.channelId) {
      this.logger.error('Missing Telegram configuration');
      throw new Error('TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID must be set');
    }
  }

  async checkSubscription(telegramId: string): Promise<boolean> {
    try {
      const response = await axios.get(
        `https://api.telegram.org/bot${this.botToken}/getChatMember`,
        {
          params: {
            chat_id: this.channelId,
            user_id: telegramId,
          },
          timeout: 5000, // 5 second timeout
        },
      );

      const { status } = response.data.result;
      return ['member', 'administrator', 'creator'].includes(status);
    } catch (error) {
      this.logger.error('Telegram API error:', error);
      throw new TelegramAPIException(
        'Failed to verify subscription with Telegram',
      );
    }
  }
}
