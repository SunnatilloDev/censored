// src/tasks/tasks.controller.ts
import { Controller, Post, Put, Get, Param, Body } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskStatusDto } from './dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.createTask(createTaskDto);
  }

  @Get('airdrop/:airdropId')
  async getTasksByAirdrop(@Param('airdropId') airdropId: number) {
    return this.tasksService.getTasksByAirdrop(airdropId);
  }

  @Put(':id/status')
  async updateTaskStatus(
    @Param('id') taskId: number,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
  ) {
    return this.tasksService.updateTaskStatus(taskId, updateTaskStatusDto);
  }
}
