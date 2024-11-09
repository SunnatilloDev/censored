import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { AirdropsService } from './airdrops.service';
import { CreateAirdropDto, ParticipateAirdropDto } from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Airdrops')
@Controller('airdrops')
export class AirdropsController {
  constructor(private readonly airdropService: AirdropsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new airdrop with tasks' })
  @ApiBody({ type: CreateAirdropDto })
  @ApiResponse({
    status: 201,
    description: 'Airdrop created successfully',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to create airdrop with tasks',
  })
  async createAirdrop(@Body() airdropData: CreateAirdropDto) {
    return await this.airdropService.createAirdrop(airdropData);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific airdrop' })
  @ApiParam({ name: 'id', description: 'Airdrop ID' })
  @ApiResponse({
    status: 200,
    description: 'Airdrop details',
  })
  @ApiResponse({
    status: 404,
    description: 'Airdrop not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve airdrop',
  })
  async getAirdrop(@Param('id') airdropId: string) {
    return await this.airdropService.getAirdrop(Number(airdropId));
  }

  @Get()
  @ApiOperation({ summary: 'Get a list of all airdrops' })
  @ApiResponse({
    status: 200,
    description: 'List of all airdrops',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve airdrops',
  })
  async getAllAirdrops() {
    return await this.airdropService.getAllAirdrops();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search airdrops by query' })
  @ApiQuery({ name: 'query', description: 'Search query' })
  @ApiResponse({
    status: 200,
    description: 'Search results for airdrops',
  })
  async searchAirdrops(@Query('query') query: string) {
    return this.airdropService.searchAirdrops(query);
  }

  @Post(':id/participate')
  @ApiOperation({ summary: 'Participate in an airdrop' })
  @ApiParam({ name: 'id', description: 'Airdrop ID' })
  @ApiBody({ type: ParticipateAirdropDto })
  @ApiResponse({
    status: 201,
    description: 'User registered as a participant in the airdrop',
  })
  @ApiResponse({
    status: 400,
    description: 'User is already participating',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to register participant',
  })
  async participateInAirdrop(
    @Param('id') airdropId: string,
    @Body() data: ParticipateAirdropDto,
  ) {
    return await this.airdropService.participateInAirdrop(
      Number(airdropId),
      data,
    );
  }

  @Post(':id/tasks/:taskId/complete')
  @ApiOperation({ summary: 'Complete a task in an airdrop' })
  @ApiParam({ name: 'id', description: 'Airdrop ID' })
  @ApiParam({ name: 'taskId', description: 'Task ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number' },
      },
      required: ['userId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Task marked as completed for the user',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found or does not belong to this airdrop',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to complete task',
  })
  async completeTask(
    @Param('id') airdropId: string,
    @Param('taskId') taskId: string,
    @Body('userId') userId: number,
  ) {
    return await this.airdropService.completeTask(
      Number(airdropId),
      userId,
      Number(taskId),
    );
  }
}
