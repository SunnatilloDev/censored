import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import axios from 'axios';
import { CreateUserDto } from '../users/dto';

interface RequestWithUser extends Request {
  user?: CreateUserDto;
}

@Injectable()
export class SubscriptionCheckMiddleware implements NestMiddleware {
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private subscriptionCache = new Map<
    number,
    { status: boolean; timestamp: number }
  >();

  constructor(private prisma: PrismaService) {}

  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      console.log(
        'SubscriptionCheckMiddleware: Checking subscription for request',
        {
          path: req.url,
          method: req.method,
          userId: req.user?.id,
        },
      );

      const userId = req.user?.id;
      if (!userId) {
        console.log('SubscriptionCheckMiddleware: No user ID found in request');
        throw new UnauthorizedException('User not authenticated');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          telegramId: true,
          isSubscribed: true,
          isBlocked: true,
          role: true,
        },
      });

      if (!user) {
        console.log('SubscriptionCheckMiddleware: User not found', { userId });
        throw new UnauthorizedException('User not found');
      }

      console.log('SubscriptionCheckMiddleware: User found', {
        userId,
        role: user.role,
        isBlocked: user.isBlocked,
        isSubscribed: user.isSubscribed,
      });

      // Allow admins and owners to bypass subscription check
      if (user.role === 'OWNER' || user.role === 'ADMIN') {
        console.log('SubscriptionCheckMiddleware: Admin/Owner bypass');
        return next();
      }

      // Block access for blocked users
      if (user.isBlocked) {
        console.log('SubscriptionCheckMiddleware: Blocked user detected', {
          userId,
        });
        throw new UnauthorizedException('Your account has been blocked');
      }

      // Check cache first
      const cached = this.subscriptionCache.get(userId);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('SubscriptionCheckMiddleware: Using cached status', {
          userId,
          status: cached.status,
          cacheAge: Date.now() - cached.timestamp,
        });

        if (!cached.status) {
          throw new UnauthorizedException(
            'You must be subscribed to access this content',
          );
        }
        return next();
      }

      // If user is not subscribed in DB, check Telegram
      if (!user.isSubscribed) {
        console.log(
          'SubscriptionCheckMiddleware: Checking Telegram subscription',
          {
            userId,
            telegramId: user.telegramId,
          },
        );

        const isSubscribed = await this.checkTelegramSubscription(
          Number(user.telegramId),
        );

        console.log(
          'SubscriptionCheckMiddleware: Telegram subscription status',
          {
            userId,
            isSubscribed,
          },
        );

        // Update cache and database
        this.subscriptionCache.set(userId, {
          status: isSubscribed,
          timestamp: Date.now(),
        });

        await this.prisma.user.update({
          where: { id: userId },
          data: { isSubscribed },
        });

        if (!isSubscribed) {
          throw new UnauthorizedException(
            'You must be subscribed to access this content',
          );
        }
      }

      next();
    } catch (error) {
      console.error('SubscriptionCheckMiddleware: Error', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  private async checkTelegramSubscription(
    telegramId: number,
  ): Promise<boolean> {
    if (!telegramId) {
      return false;
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const channelId = process.env.TELEGRAM_CHANNEL_ID;

    if (!botToken || !channelId) {
      console.error('Missing Telegram configuration');
      return false;
    }

    try {
      const response = await axios.get(
        `https://api.telegram.org/bot${botToken}/getChatMember`,
        {
          params: {
            chat_id: channelId,
            user_id: telegramId,
          },
          timeout: 5000, // 5 second timeout
        },
      );

      const { status } = response.data.result;
      return ['member', 'administrator', 'creator'].includes(status);
    } catch (error) {
      console.error('Telegram API error:', error);
      // On error, we'll be lenient and allow access
      // This prevents blocking users due to temporary Telegram API issues
      return true;
    }
  }
}
