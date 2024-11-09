import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAirdropDto, ParticipateAirdropDto } from './dto';

@Injectable()
export class AirdropsService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new airdrop with tasks

  async createAirdrop(airdropData: CreateAirdropDto) {
    try {
      return await this.prisma.airdrop.create({
        data: {
          name: airdropData.name,
          description: airdropData.description,
          startDate: airdropData.startDate,
          endDate: airdropData.endDate,
          prizePool: airdropData.prizePool,
          tasks: {
            create: airdropData.tasks.map((task) => ({
              title: task.name,
              description: task.description,
              type: task.type ?? 'General', // Provide a default if missing
              openingDate: task.openingDate ?? new Date(), // Default to current date if missing
            })),
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create airdrop with tasks.',
      );
    }
  }

  // Retrieve a specific airdrop
  async getAirdrop(airdropId: number) {
    try {
      const airdrop = await this.prisma.airdrop.findUnique({
        where: { id: airdropId },
        include: {
          tasks: true,
          participants: {
            include: { user: true },
          },
        },
      });

      if (!airdrop) {
        throw new NotFoundException(`Airdrop with ID ${airdropId} not found.`);
      }
      return airdrop;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve airdrop.');
    }
  }

  // Get all airdrops
  async getAllAirdrops() {
    try {
      return await this.prisma.airdrop.findMany();
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve airdrops.');
    }
  }

  // Register user participation in an airdrop
  async participateInAirdrop(airdropId: number, data: ParticipateAirdropDto) {
    const { userId } = data;
    try {
      const existingParticipant = await this.prisma.userAirdrop.findUnique({
        where: {
          userId_airdropId: { userId, airdropId },
        },
      });

      if (existingParticipant) {
        throw new BadRequestException('User is already participating.');
      }

      return await this.prisma.userAirdrop.create({
        data: {
          userId,
          airdropId,
          tasksCompleted: 0,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to register participant.');
    }
  }

  // Complete a task in an airdrop for a user
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
      throw new InternalServerErrorException('Failed to complete task.');
    }
  }
  async searchAirdrops(query: string) {
    return this.prisma.airdrop.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { tasks: true, participants: true },
    });
  }
}
