// src/status/status.module.ts
import { Module } from '@nestjs/common';
import { StatusGateway } from './ws.gateway';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [StatusGateway, PrismaService],
})
export class StatusModule {}
