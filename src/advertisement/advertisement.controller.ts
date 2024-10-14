import { Controller, Post, Put, Get, Param, Body } from '@nestjs/common';
import { AdvertisementService } from './advertisement.service';
import { CreateAdvertisementDto, UpdateAdvertisementDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Advertisements')
@Controller('advertisements')
export class AdvertisementController {
  constructor(private readonly advertisementService: AdvertisementService) {}

  @Post()
  async createAdvertisement(@Body() adData: CreateAdvertisementDto) {
    return await this.advertisementService.createAdvertisement(adData);
  }

  @Put(':id')
  async updateAdvertisement(
    @Param('id') adId: string,
    @Body() updateData: UpdateAdvertisementDto,
  ) {
    return await this.advertisementService.updateAdvertisement(
      parseInt(adId),
      updateData,
    );
  }

  @Get(':id')
  async getAdvertisement(@Param('id') adId: string) {
    return await this.advertisementService.getAdvertisement(parseInt(adId));
  }

  @Post(':id/track')
  async trackAdPerformance(
    @Param('id') adId: string,
    @Body() body: { type: 'click' | 'impression' },
  ) {
    return await this.advertisementService.trackAdPerformance(
      parseInt(adId),
      body.type,
    );
  }
}
