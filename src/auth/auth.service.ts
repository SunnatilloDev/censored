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
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });

      // Ensure the refresh token belongs to a valid user
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new ForbiddenException('User not found');
      }

      // Generate a new access token and refresh token
      const newTokens = this.jwtGenerator({
        userId: user.id,
        email: user.username,
      });

      return newTokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  jwtGenerator(payload) {
    return {
      accessToken: this.jwtService.sign(payload, {
        privateKey: process.env.JWT_SECRET,
        expiresIn: '15m',
      }),
      refreshToken: this.jwtService.sign(payload, {
        privateKey: process.env.JWT_SECRET,
        expiresIn: '30d',
      }),
    };
  }
  // Function to verify and register a user
  async verifyAndRegisterUser(telegramData: any) {
    try {
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

      const user = await this.prisma.user.upsert({
        where: { telegramId },
        update: {
          username,
          firstName,
          lastName,
          photo_url,
          isSubscribed: true,
        },
        create: {
          telegramId,
          username,
          firstName,
          lastName,
          photo_url,
          isSubscribed: true,
          role: Role.USER, // Default role set to USER
          status: 'offline',
        },
      });
      const { accessToken, refreshToken } = this.jwtGenerator({
        userId: user.id,
        email: username,
      });
      return {
        isSubscribed: true,
        user,
        tokens: { accessToken, refreshToken },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to verify and register user.',
      );
    }
  }

  // Function to check if a user is subscribed
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

      const { status } = response.data.result;
      return (
        status === 'member' ||
        status === 'administrator' ||
        status === 'creator'
      );
    } catch (error) {
      console.error('Error checking Telegram subscription:', error);

      if (error.response && error.response.data) {
        throw new ForbiddenException(
          `Telegram API Error: ${error.response.data.description}`,
        );
      }

      throw new InternalServerErrorException(
        'Failed to check Telegram subscription.',
      );
    }
  }

  // Function to check if a user has the required role
  async hasRole(userId: number, requiredRole: Role): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new ForbiddenException('User not found.');
    }

    return user.role === requiredRole || user.role === Role.OWNER;
  }
}
