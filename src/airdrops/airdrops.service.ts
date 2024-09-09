import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class AirdropsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createAirdrop(airdropData: any) {
    try {
      const airdrop = await this.prisma.airdrop.create({
        data: {
          name: airdropData.name,
          description: airdropData.description,
          isActive: true,
          startDate: airdropData.startDate,
          endDate: airdropData.endDate,
          prizePool: airdropData.prizePool,
        },
      });
      await this.notifyUsersAboutAirdrop(airdrop);
      return airdrop;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create airdrop.');
    }
  }

  private async notifyUsersAboutAirdrop(airdrop: any) {
    try {
      const subscribedUsers = await this.prisma.user.findMany({
        where: { isSubscribed: true },
      });

      for (const user of subscribedUsers) {
        const message = `🚀 New Airdrop: ${airdrop.name}\n\n${airdrop.description}\n\nPrize Pool: ${airdrop.prizePool}`;
        await this.notificationsService.sendNotification(
          user.telegramId,
          message,
        );
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to notify users.');
    }
  }

  async incrementAirdropViews(airdropId: number, userId: number) {
    try {
      const hasViewed = await this.prisma.airdropView.findUnique({
        where: {
          userId_airdropId: {
            userId,
            airdropId,
          },
        },
      });

      if (!hasViewed) {
        await this.prisma.airdrop.update({
          where: { id: airdropId },
          data: {
            views: {
              increment: 1,
            },
          },
        });

        await this.prisma.airdropView.create({
          data: {
            userId,
            airdropId,
          },
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to increment airdrop views.',
      );
    }
  }

  async getAirdrop(airdropId: string, userId: number) {
    try {
      await this.incrementAirdropViews(parseInt(airdropId), userId);
      const airdrop = await this.prisma.airdrop.findUnique({
        where: { id: parseInt(airdropId) },
        include: {
          participants: true,
          tasks: true,
        },
      });

      if (!airdrop) {
        throw new NotFoundException(`Airdrop with ID ${airdropId} not found.`);
      }

      return airdrop;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve airdrop.');
    }
  }

  async updateAirdrop(airdropId: string, updateData: any) {
    try {
      const airdropExists = await this.prisma.airdrop.findUnique({
        where: { id: parseInt(airdropId) },
      });

      if (!airdropExists) {
        throw new NotFoundException(`Airdrop with ID ${airdropId} not found.`);
      }

      return await this.prisma.airdrop.update({
        where: { id: parseInt(airdropId) },
        data: {
          name: updateData.name,
          description: updateData.description,
          isActive: updateData.isActive,
          startDate: updateData.startDate,
          endDate: updateData.endDate,
          prizePool: updateData.prizePool,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update airdrop.');
    }
  }

  async getParticipants(airdropId: string) {
    try {
      return await this.prisma.userAirdrop.findMany({
        where: { airdropId: parseInt(airdropId) },
        include: {
          user: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve participants.',
      );
    }
  }

  async participateInAirdrop(airdropId: string, userId: string) {
    try {
      const existingParticipant = await this.prisma.userAirdrop.findUnique({
        where: {
          userId_airdropId: {
            userId: parseInt(userId),
            airdropId: parseInt(airdropId),
          },
        },
      });

      if (existingParticipant) {
        throw new BadRequestException(
          'User is already participating in this airdrop.',
        );
      }

      return await this.prisma.userAirdrop.create({
        data: {
          userId: parseInt(userId),
          airdropId: parseInt(airdropId),
          tasksCompleted: 0,
          referredUsers: 0,
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to participate in airdrop.',
      );
    }
  }

  async completeTask(airdropId: string, userId: number, taskId: string) {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id: parseInt(taskId) },
      });

      if (!task || task.airdropId !== parseInt(airdropId)) {
        throw new NotFoundException(
          'Task not found or does not belong to this airdrop.',
        );
      }

      await this.prisma.task.update({
        where: { id: parseInt(taskId) },
        data: { isCompleted: true },
      });

      return await this.prisma.userAirdrop.update({
        where: {
          userId_airdropId: {
            userId: userId,
            airdropId: parseInt(airdropId),
          },
        },
        data: {
          tasksCompleted: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to complete task.');
    }
  }
}
