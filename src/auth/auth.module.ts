import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [AuthService, PrismaService],
  exports: [AuthService], // Export AuthService to use in other modules
})
export class AuthModule {}
