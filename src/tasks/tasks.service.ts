// src/tasks/tasks.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto';
import { UpdateTaskStatusDto } from './dto';
import { NotificationsService } from '../notifications/notifications.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createTask(createTaskDto: CreateTaskDto) {
    const {
      title,
      description,
      type,
      openingDate,
      airdropId,
      promoCode,
      question,
      options,
      correctAnswer,
    } = createTaskDto;
    try {
      const task = await this.prisma.task.create({
        data: {
          title,
          description,
          type,
          openingDate: openingDate ? new Date(openingDate) : null,
          airdropId,
          promoCode,
          question,
          options,
          correctAnswer,
        },
      });

      if (type === 'PromoCode') {
        await this.notifyParticipantsForPromoCodeTask(airdropId, task.id);
      }

      return task;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create task.');
    }
  }

  async getTasksByAirdrop(airdropId: number) {
    return await this.prisma.task.findMany({ where: { airdropId } });
  }

  async updateTaskStatus(
    taskId: number,
    updateTaskStatusDto: UpdateTaskStatusDto,
  ) {
    const { userId, isCompleted } = updateTaskStatusDto;
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });

    if (!task) throw new NotFoundException(`Task with ID ${taskId} not found.`);

    await this.prisma.userAirdrop.update({
      where: { userId_airdropId: { userId, airdropId: task.airdropId } },
      data: { tasksCompleted: { increment: isCompleted ? 1 : 0 } },
    });

    if (isCompleted)
      await this.checkAndNotifyIncompleteTasks(userId, task.airdropId);
  }
  async checkAndNotifyIncompleteTasks(userId: number, airdropId: number) {
    const incompleteTasks = await this.prisma.task.findMany({
      where: {
        airdropId,
        isCompleted: false,
      },
    });

    if (incompleteTasks.length > 0) {
      await this.notificationsService.sendTelegramNotification(
        userId.toString(),
        'You have incomplete tasks in the airdrop!',
      );
    }
  }
  @Cron('0 * * * *')
  async notifyUsersWithIncompleteTasks() {
    const userAirdrops = await this.prisma.userAirdrop.findMany({
      include: { user: true, airdrop: { include: { tasks: true } } },
    });

    for (const userAirdrop of userAirdrops) {
      const totalTasks = userAirdrop.airdrop.tasks.length;
      if (userAirdrop.tasksCompleted < totalTasks) {
        await this.notificationsService.sendTelegramNotification(
          userAirdrop.user.telegramId,
          'You have incomplete tasks in the airdrop! Please complete them soon.',
        );
      }
    }
  }

  async notifyParticipantsForPromoCodeTask(airdropId: number, taskId: number) {
    const airdrop = await this.prisma.airdrop.findUnique({
      where: { id: airdropId },
      include: { participants: { select: { userId: true } } },
    });

    if (airdrop) {
      for (const participant of airdrop.participants) {
        await this.notificationsService.sendTelegramNotification(
          participant.userId.toString(),
          'A new Promo Code task is available! Complete it to earn extra points.',
        );
      }
    }
  }
}
