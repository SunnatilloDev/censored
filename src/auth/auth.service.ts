import {
  Injectable,
  InternalServerErrorException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { Role } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as process from 'node:process'; // Import the Role enum from Prisma

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async refreshAccessToken(refreshToken: string) {
    try {
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token is required');
      }

      // Verify the refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET,
      });

      if (!payload.userId) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Ensure the refresh token belongs to a valid user
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, username: true, isBlocked: true },
      });

      if (!user) {
        throw new ForbiddenException('User not found');
      }

      if (user.isBlocked) {
        throw new ForbiddenException('User is blocked');
      }

      // Generate a new access token and refresh token
      const newTokens = await this.jwtGenerator({
        userId: user.id,
        username: user.username,
      });

      return newTokens;
    } catch (error) {
      console.error('Error refreshing token:', error);
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async jwtGenerator(payload: { userId: number; username: string }) {
    if (!process.env.JWT_SECRET) {
      throw new InternalServerErrorException('JWT secret is not configured');
    }

    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, {
          secret: process.env.JWT_SECRET,
          expiresIn: '15m',
        }),
        this.jwtService.signAsync(payload, {
          secret: process.env.JWT_SECRET,
          expiresIn: '30d',
        }),
      ]);

      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Error generating tokens:', error);
      throw new InternalServerErrorException('Failed to generate tokens');
    }
  }

  // Function to verify and register a user
  async verifyAndRegisterUser(telegramData: any) {
    try {
      if (!telegramData || !telegramData.id) {
        throw new ForbiddenException('Invalid Telegram data');
      }

      const {
        id: telegramId,
        username,
        first_name: firstName,
        last_name: lastName,
        photo_url,
      } = telegramData;

      const isSubscribed = await this.checkSubscription(telegramId);

      if (!isSubscribed) {
        return { isSubscribed: false };
      }

      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { telegramId },
        select: { isBlocked: true },
      });

      if (existingUser?.isBlocked) {
        throw new ForbiddenException('User is blocked');
      }

      const user = await this.prisma.user.upsert({
        where: { telegramId },
        update: {
          username,
          firstName,
          lastName,
          photo_url,
          isSubscribed: true,
          lastOnline: new Date(),
        },
        create: {
          telegramId,
          username,
          firstName,
          lastName,
          photo_url,
          isSubscribed: true,
          role: Role.USER,
          status: 'online',
          lastOnline: new Date(),
        },
      });

      const tokens = await this.jwtGenerator({
        userId: user.id,
        username: user.username,
      });

      return {
        isSubscribed: true,
        user,
        tokens,
      };
    } catch (error) {
      console.error('Error in verifyAndRegisterUser:', error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to verify and register user');
    }
  }

  // Function to check if a user is subscribed
  async checkSubscription(telegramId: string): Promise<boolean> {
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHANNEL_ID) {
      throw new InternalServerErrorException('Telegram configuration is missing');
    }

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
          timeout: 5000, // 5 second timeout
        },
      );

      if (!response.data?.result?.status) {
        throw new Error('Invalid response from Telegram API');
      }

      const { status } = response.data.result;
      return ['member', 'administrator', 'creator'].includes(status);
    } catch (error) {
      console.error('Error checking Telegram subscription:', error);

      if (axios.isAxiosError(error)) {
        if (error.response?.data) {
          throw new ForbiddenException(
            `Telegram API Error: ${error.response.data.description}`,
          );
        }
        if (error.code === 'ECONNABORTED') {
          throw new InternalServerErrorException('Telegram API timeout');
        }
      }

      throw new InternalServerErrorException('Failed to check Telegram subscription');
    }
  }

  // Function to check if a user has the required role
  async hasRole(userId: number, requiredRole: Role): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, isBlocked: true },
      });

      if (!user) {
        throw new ForbiddenException('User not found');
      }

      if (user.isBlocked) {
        throw new ForbiddenException('User is blocked');
      }

      // Owner has all permissions
      if (user.role === Role.OWNER) {
        return true;
      }

      // For ADMIN role, allow access to everything except OWNER-specific routes
      if (user.role === Role.ADMIN && requiredRole !== Role.OWNER) {
        return true;
      }

      return user.role === requiredRole;
    } catch (error) {
      console.error('Error checking user role:', error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to verify user role');
    }
  }
}
