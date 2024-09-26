import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { SubscriptionCheckMiddleware } from 'src/middleware/subscription-check.middleware';

@Module({})
export class UsersModule {}
