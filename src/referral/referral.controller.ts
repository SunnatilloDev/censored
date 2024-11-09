import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { CreateReferralDto, TrackReferralDto } from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Referrals')
@Controller('referrals')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  // Generate a referral link for a specific event
  @Post()
  @ApiOperation({
    summary: 'Create a referral link for a specific event/airdrop',
  })
  @ApiBody({ type: CreateReferralDto })
  @ApiResponse({
    status: 201,
    description: 'Referral link created successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createReferral(@Body() data: CreateReferralDto) {
    return await this.referralService.createReferral(data);
  }

  // Track referral usage
  @Post('track')
  @ApiOperation({ summary: 'Track referral usage by a referred user' })
  @ApiBody({ type: TrackReferralDto })
  @ApiResponse({ status: 200, description: 'Referral tracked successfully' })
  @ApiResponse({ status: 404, description: 'Invalid referral link' })
  @ApiResponse({ status: 400, description: 'Referral link already used' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async trackReferral(@Body() data: TrackReferralDto) {
    return await this.referralService.trackReferral(
      data.referralLink,
      data.referredId,
    );
  }

  // Get all referrals made by a specific user
  @Get(':referrerId')
  @ApiOperation({ summary: 'Get all referrals made by a specific user' })
  @ApiParam({
    name: 'referrerId',
    description: 'ID of the referrer user',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'List of referrals retrieved successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserReferrals(@Param('referrerId') referrerId: string) {
    return await this.referralService.getUserReferrals(parseInt(referrerId));
  }
}
