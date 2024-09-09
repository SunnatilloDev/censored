import { PrismaClient } from '@prisma/client';

export interface Article {
  id: number;
  title: string;
  content: string;
  categoryId: number;
  createdBy: number;
  idActive: boolean;
  publishDate: string;
  createdAt: string;
  updatedAt: string;
}
