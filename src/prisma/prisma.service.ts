import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Prisma connected to the database');
    } catch (error) {
      console.error('Failed to connect to the database:', error);
      throw new InternalServerErrorException(
        'Failed to connect to the database.',
      );
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      console.log('Prisma disconnected from the database');
    } catch (error) {
      console.error('Failed to disconnect from the database:', error);
      throw new InternalServerErrorException(
        'Failed to disconnect from the database.',
      );
    }
  }
}
