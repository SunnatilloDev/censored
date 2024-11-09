import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { AirdropsService } from './airdrops.service';
import { CreateAirdropDto, ParticipateAirdropDto } from './dto';
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
  async getAirdrop(@Param('id') airdropId: string) {
    return await this.airdropService.getAirdrop(Number(airdropId));
  }

  @Get()
  async getAllAirdrops() {
    return await this.airdropService.getAllAirdrops();
  }
  @Get('search')
  async searchAirdrops(@Query('query') query: string) {
    return this.airdropService.searchAirdrops(query);
  }
  @Post(':id/participate')
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
