import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdvertisementService } from './advertisement.service';
import { CreateAdvertisementDto, UpdateAdvertisementDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Advertisements')
@Controller('advertisements')
@UseGuards(RolesGuard)
export class AdvertisementController {
  constructor(private readonly advertisementService: AdvertisementService) {}
  @Roles(Role.MODERATOR, Role.ADMIN, Role.OWNER)
  @Post()
  async createAdvertisement(@Body() adData: CreateAdvertisementDto) {
    return await this.advertisementService.createAdvertisement(adData);
  }

  @Get()
  async getAllAdvertisements() {
    return await this.advertisementService.getAllAdvertisements();
  }

  @Get(':id')
  async getAdvertisement(@Param('id') adId: string) {
    return await this.advertisementService.getAdvertisement(parseInt(adId));
  }
  @Roles(Role.MODERATOR, Role.ADMIN, Role.OWNER)
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
  @Roles(Role.MODERATOR, Role.ADMIN, Role.OWNER)
  @Delete(':id')
  async deleteAdvertisement(@Param('id') adId: string) {
    return await this.advertisementService.deleteAdvertisement(parseInt(adId));
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
