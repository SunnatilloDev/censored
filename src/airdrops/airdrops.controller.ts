import { Controller, Post, Get, Put, Param, Body, Query } from '@nestjs/common';
import { AirdropsService } from './airdrops.service';
import { CreateAirdropDto, UpdateAirdropDto } from 'src/airdrops/dto/index';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Airdrops')
@Controller('airdrops')
export class AirdropsController {
  constructor(private readonly airdropService: AirdropsService) {}

  @Post()
  async createAirdrop(@Body() airdropData: CreateAirdropDto) {
    return await this.airdropService.createAirdrop(airdropData);
  }

  @Get(':id')
  async getAirdrop(
    @Param('id') airdropId: string,
    @Query('userId') userId: number,
  ) {
    return await this.airdropService.getAirdrop(Number(airdropId), userId);
  }

  @Put(':id')
  async updateAirdrop(
    @Param('id') airdropId: string,
    @Body() updateData: UpdateAirdropDto,
  ) {
    return await this.airdropService.updateAirdrop(
      Number(airdropId),
      updateData,
    );
  }

  @Get(':id/participants')
  async getParticipants(@Param('id') airdropId: string) {
    return await this.airdropService.getParticipants(Number(airdropId));
  }
  @Post(':id/tasks/:taskId/complete')
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
