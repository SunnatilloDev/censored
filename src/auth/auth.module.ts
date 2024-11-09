import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [AuthService, PrismaService, JwtService],
  exports: [AuthService], // Export AuthService to use in other modules
})
export class AuthModule {}
