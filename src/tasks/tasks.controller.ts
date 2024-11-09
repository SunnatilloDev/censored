// src/tasks/tasks.controller.ts
import { Controller, Post, Put, Get, Param, Body } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskStatusDto } from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task (Promo Code or Quiz)' })
  @ApiResponse({
    status: 201,
    description: 'The task has been successfully created.',
  })
  @ApiBody({ type: CreateTaskDto, description: 'Details for creating a task' })
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.createTask(createTaskDto);
  }

  @Get('airdrop/:airdropId')
  @ApiOperation({ summary: 'Get tasks associated with a specific airdrop' })
  @ApiParam({ name: 'airdropId', description: 'ID of the airdrop' })
  @ApiResponse({
    status: 200,
    description: 'Returns tasks associated with the specified airdrop',
  })
  async getTasksByAirdrop(@Param('airdropId') airdropId: number) {
    return this.tasksService.getTasksByAirdrop(airdropId);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update the status of a task' })
  @ApiParam({ name: 'id', description: 'ID of the task to update' })
  @ApiBody({
    type: UpdateTaskStatusDto,
    description: 'Data for updating task status',
  })
  @ApiResponse({
    status: 200,
    description: 'The status of the task has been updated successfully',
  })
  async updateTaskStatus(
    @Param('id') taskId: number,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
  ) {
    return this.tasksService.updateTaskStatus(taskId, updateTaskStatusDto);
  }
}
