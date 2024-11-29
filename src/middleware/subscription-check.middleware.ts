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
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private subscriptionCache = new Map<number, { status: boolean; timestamp: number }>();

  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
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
        }
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Allow admins and owners to bypass subscription check
      if (user.role === 'OWNER' || user.role === 'ADMIN') {
        return next();
      }

      // Block access for blocked users
      if (user.isBlocked) {
        throw new UnauthorizedException('Your account has been blocked');
      }

      // Check cache first
      const cached = this.subscriptionCache.get(userId);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        if (!cached.status) {
          throw new UnauthorizedException('You must be subscribed to access this content');
        }
        return next();
      }

      // If user is not subscribed in DB, check Telegram
      if (!user.isSubscribed) {
        const isSubscribed = await this.checkTelegramSubscription(user.telegramId);
        
        // Update cache and database
        this.subscriptionCache.set(userId, {
          status: isSubscribed,
          timestamp: Date.now()
        });

        await this.prisma.user.update({
          where: { id: userId },
          data: { isSubscribed }
        });

        if (!isSubscribed) {
          throw new UnauthorizedException('You must be subscribed to access this content');
        }
      }

      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Subscription check error:', error);
      throw new UnauthorizedException('Error checking subscription status');
    }
  }

  private async checkTelegramSubscription(telegramId: number): Promise<boolean> {
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
        }
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
