import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import axios from 'axios';
import { CreateUserDto } from '../users/dto';
import { IncomingHttpHeaders } from 'http';

interface Request {
  user?: CreateUserDto;
  headers: IncomingHttpHeaders;
}
@Injectable()
export class SubscriptionCheckMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const userId = req.user.id; // Assuming the user is authenticated and their ID is available
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // If user is already flagged as unsubscribed, restrict access
    if (!user.isSubscribed) {
      throw new UnauthorizedException(
        'You must be subscribed to access this content',
      );
    }

    // Check subscription status with Telegram API
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const channelId = process.env.TELEGRAM_CHANNEL_ID;

    try {
      const response = await axios.get(
        `https://api.telegram.org/bot${botToken}/getChatMember`,
        {
          params: {
            chat_id: channelId,
            user_id: user.telegramId,
          },
        },
      );

      const { status } = response.data.result;

      // If the user is not a member, flag them as unsubscribed
      if (
        status !== 'member' &&
        status !== 'administrator' &&
        status !== 'creator'
      ) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { isSubscribed: false },
        });

        throw new UnauthorizedException(
          'You must be subscribed to access this content',
        );
      }
    } catch (error) {
      console.error('Error checking Telegram subscription:', error);
      throw new UnauthorizedException('Error checking subscription status');
    }

    next();
  }
}
