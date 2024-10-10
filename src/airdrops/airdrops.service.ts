import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

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
          isActive: airdropData.isActive ?? true, // Optional isActive flag
          startDate: new Date(airdropData.startDate),
          endDate: new Date(airdropData.endDate),
          prizePool: airdropData.prizePool,
        },
      });

      await this.notifyUsersAboutAirdrop(airdrop);
      return airdrop;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to create airdrop.');
    }
  }

  private async notifyUsersAboutAirdrop(airdrop: any) {
    try {
      const subscribedUsers = await this.prisma.user.findMany({
        where: { isSubscribed: true },
      });

      const notifications = subscribedUsers.map((user) => {
        const message = `🚀 New Airdrop: ${airdrop.name}\n\n${airdrop.description}\n\nPrize Pool: ${airdrop.prizePool}`;
        return this.notificationsService.sendNotification(
          user.telegramId,
          message,
        );
      });

      await Promise.all(notifications); // Notify all users asynchronously
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to notify users.');
    }
  }

  async incrementAirdropViews(airdropId: number, userId: number) {
    try {
      const hasViewed = await this.prisma.airdropView.findUnique({
        where: {
          userId_airdropId: { userId, airdropId },
        },
      });

      if (!hasViewed) {
        await this.prisma.airdrop.update({
          where: { id: airdropId },
          data: {},
        });

        await this.prisma.airdropView.create({
          data: { userId, airdropId },
        });
      }
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to increment airdrop views.',
      );
    }
  }

  async getAirdrop(airdropId: number, userId: number) {
    try {
      await this.incrementAirdropViews(airdropId, userId);
      const airdrop = await this.prisma.airdrop.findUnique({
        where: { id: airdropId },
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
      console.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve airdrop.');
    }
  }

  async updateAirdrop(airdropId: number, updateData: any) {
    try {
      const airdropExists = await this.prisma.airdrop.findUnique({
        where: { id: airdropId },
      });

      if (!airdropExists) {
        throw new NotFoundException(`Airdrop with ID ${airdropId} not found.`);
      }

      return await this.prisma.airdrop.update({
        where: { id: airdropId },
        data: {
          name: updateData.name,
          description: updateData.description,
          isActive: updateData.isActive,
          startDate: new Date(updateData.startDate),
          endDate: new Date(updateData.endDate),
          prizePool: updateData.prizePool,
        },
      });
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update airdrop.');
    }
  }

  async getParticipants(airdropId: number) {
    try {
      return await this.prisma.userAirdrop.findMany({
        where: { airdropId },
        include: { user: true },
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to retrieve participants.',
      );
    }
  }

  async participateInAirdrop(airdropId: number, userId: number) {
    try {
      const existingParticipant = await this.prisma.userAirdrop.findUnique({
        where: {
          userId_airdropId: { userId, airdropId },
        },
      });

      if (existingParticipant) {
        throw new BadRequestException(
          'User is already participating in this airdrop.',
        );
      }

      return await this.prisma.userAirdrop.create({
        data: {
          userId,
          airdropId,
          tasksCompleted: 0,
          referredUsers: 0,
        },
      });
    } catch (error) {
      console.error(error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to participate in airdrop.',
      );
    }
  }

  async completeTask(airdropId: number, userId: number, taskId: number) {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!task || task.airdropId !== airdropId) {
        throw new NotFoundException(
          'Task not found or does not belong to this airdrop.',
        );
      }

      await this.prisma.task.update({
        where: { id: taskId },
        data: { isCompleted: true },
      });

      return await this.prisma.userAirdrop.update({
        where: {
          userId_airdropId: { userId, airdropId },
        },
        data: {
          tasksCompleted: { increment: 1 },
        },
      });
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to complete task.');
    }
  }
}
