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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Create a new advertisement' })
  @ApiBody({ type: CreateAdvertisementDto })
  @ApiResponse({
    status: 201,
    description: 'The advertisement has been successfully created.',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to create advertisement due to an internal error.',
  })
  async createAdvertisement(@Body() adData: CreateAdvertisementDto) {
    return await this.advertisementService.createAdvertisement(adData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all advertisements' })
  @ApiResponse({
    status: 200,
    description: 'List of all advertisements',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve advertisements due to an internal error.',
  })
  async getAllAdvertisements() {
    return await this.advertisementService.getAllAdvertisements();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get advertisement by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Advertisement ID' })
  @ApiResponse({
    status: 200,
    description: 'Advertisement details for the given ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Advertisement not found for the provided ID.',
  })
  async getAdvertisement(@Param('id') adId: string) {
    return await this.advertisementService.getAdvertisement(parseInt(adId));
  }

  @Roles(Role.MODERATOR, Role.ADMIN, Role.OWNER)
  @Put(':id')
  @ApiOperation({ summary: 'Update advertisement by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Advertisement ID' })
  @ApiBody({ type: UpdateAdvertisementDto })
  @ApiResponse({
    status: 200,
    description: 'The advertisement has been successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'Advertisement not found for the provided ID.',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to update advertisement due to an internal error.',
  })
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
  @ApiOperation({ summary: 'Delete advertisement by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Advertisement ID' })
  @ApiResponse({
    status: 200,
    description: 'The advertisement has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Advertisement not found for the provided ID.',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to delete advertisement due to an internal error.',
  })
  async deleteAdvertisement(@Param('id') adId: string) {
    return await this.advertisementService.deleteAdvertisement(parseInt(adId));
  }

  @Post(':id/track')
  @ApiOperation({ summary: 'Track clicks or impressions for an advertisement' })
  @ApiParam({ name: 'id', required: true, description: 'Advertisement ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['click', 'impression'],
        },
      },
      required: ['type'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Ad performance successfully tracked (click or impression).',
  })
  @ApiResponse({
    status: 404,
    description: 'Advertisement not found for the provided ID.',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to track ad performance due to an internal error.',
  })
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
