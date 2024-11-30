import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
import {
  UnauthorizedException,
  SubscriptionRequiredException,
  SubscriptionVerificationException,
  DatabaseException,
} from '../common/exceptions/custom.exceptions';

interface User {
  id: number;
  role: string;
}

interface RequestWithUser extends Request {
  user?: User;
}

@Injectable()
export class SubscriptionCheckMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SubscriptionCheckMiddleware.name);
  private readonly bypassRoles = ['ADMIN', 'OWNER'];

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramService: TelegramService,
  ) {}

  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const user = req.user;

      if (!user) {
        throw new UnauthorizedException('User not authenticated');
      }

      this.logger.debug(`Checking subscription for user ${user.id}`);

      // Bypass check for admin roles
      if (this.bypassRoles.includes(user.role)) {
        this.logger.debug(`Bypassing subscription check for ${user.role} role`);
        return next();
      }

      // Get user's telegram ID
      const userWithTelegram = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: {
          telegramId: true,
          isSubscribed: true,
        },
      }).catch(error => {
        this.logger.error(`Database error while fetching user: ${error.message}`);
        throw new DatabaseException('Failed to fetch user data');
      });

      if (!userWithTelegram?.telegramId) {
        throw new SubscriptionRequiredException('Telegram ID not linked to account');
      }

      // Verify subscription status
      const isSubscribed = await this.telegramService
        .checkSubscription(userWithTelegram.telegramId)
        .catch(error => {
          this.logger.error(`Telegram API error: ${error.message}`);
          throw new SubscriptionVerificationException();
        });

      if (!isSubscribed) {
        throw new SubscriptionRequiredException('User is not subscribed to the channel');
      }

      // Update subscription status in database if it has changed
      if (!userWithTelegram.isSubscribed) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { isSubscribed },
        }).catch(error => {
          this.logger.error(`Failed to update subscription status: ${error.message}`);
          // Don't throw here as the user is actually subscribed
          this.logger.warn('Continuing despite database update failure');
        });
      }

      this.logger.debug(`Subscription check passed for user ${user.id}`);
      next();
    } catch (error) {
      // Let the global exception filter handle the error
      throw error;
    }
  }
}
