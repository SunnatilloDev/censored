// src/auth/middleware/auth.middleware.ts
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, NextFunction, Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import * as jwt from 'jsonwebtoken';

// Define public routes that don't require authentication
const publicRoutes = [
  '/auth/telegram/callback',
  '/auth/refresh-token',
  '/api/docs',
  '/api/docs/*',
];

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Skip middleware for public routes
      if (publicRoutes.some(route => {
        if (route.endsWith('/*')) {
          return req.path.startsWith(route.slice(0, -2));
        }
        return route === req.path;
      })) {
        return next();
      }

      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new UnauthorizedException('No token provided');
      }

      const [type, token] = authHeader.split(' ');
      if (type !== 'Bearer' || !token) {
        throw new UnauthorizedException('Invalid token format');
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
          algorithms: ['HS256'], // Explicitly specify allowed algorithms
          ignoreExpiration: false, // Ensure we check token expiration
        });

        if (typeof decoded === 'string' || !decoded.userId) {
          throw new UnauthorizedException('Invalid token structure');
        }

        const user = await this.prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            username: true,
            role: true,
            isBlocked: true,
            lastOnline: true,
          },
        });

        if (!user) {
          throw new UnauthorizedException('User not found');
        }

        if (user.isBlocked) {
          throw new UnauthorizedException('Your account has been blocked');
        }

        // Update last online time
        await this.prisma.user.update({
          where: { id: user.id },
          data: { lastOnline: new Date() },
        }).catch(error => {
          console.error('Error updating last online time:', error);
          // Don't throw error as this is not critical
        });

        // Attach user to request
        req['user'] = user;
        next();
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          throw error;
        }
        if (error.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Token has expired');
        }
        if (error.name === 'JsonWebTokenError') {
          throw new UnauthorizedException('Invalid token');
        }
        console.error('Authentication error:', error);
        throw new UnauthorizedException('Invalid or expired token');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Auth middleware error:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
