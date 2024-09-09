import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async verifyAndRegisterUser(telegramData: any) {
    try {
      const {
        id: telegramId,
        username,
        first_name: firstName,
        last_name: lastName,
      } = telegramData;

      const isSubscribed = await this.checkSubscription(telegramId);

      if (!isSubscribed) {
        return { isSubscribed: false };
      }

      const user = await this.prisma.user.upsert({
        where: { telegramId },
        update: { username, firstName, lastName, isSubscribed: true },
        create: {
          telegramId,
          username,
          firstName,
          lastName,
          isSubscribed: true,
        },
      });

      return { isSubscribed: true, user };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to verify and register user.',
      );
    }
  }

  async checkSubscription(telegramId: string): Promise<boolean> {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const channelId = process.env.TELEGRAM_CHANNEL_ID;

    try {
      const response = await axios.get(
        `https://api.telegram.org/bot${botToken}/getChatMember`,
        {
          params: {
            chat_id: channelId,
            user_id: telegramId,
          },
        },
      );
      console.log(channelId, telegramId);

      const { status } = response.data.result;
      return (
        status === 'member' ||
        status === 'administrator' ||
        status === 'creator'
      );
    } catch (error) {
      console.error('Error checking Telegram subscription:', error);

      if (error.response && error.response.data) {
        throw new BadRequestException(
          `Telegram API Error: ${error.response.data.description}`,
        );
      }

      throw new InternalServerErrorException(
        'Failed to check Telegram subscription.',
      );
    }
  }
}
