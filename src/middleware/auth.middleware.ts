// src/auth/middleware/auth.middleware.ts
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, NextFunction, Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import * as jwt from 'jsonwebtoken';

// Define public routes that don’t require authentication
const publicRoutes = ['/auth/telegram/callback', '/auth/refresh-token'];

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    // Skip middleware for public routes
    if (publicRoutes.includes(req.path)) {
      return next();
    }

    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (typeof decoded !== 'string') {
        const userId = decoded.userId;

        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw new UnauthorizedException('User not found');
        }

        req['user'] = user;
        next();
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
