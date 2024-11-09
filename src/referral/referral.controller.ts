import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { CreateReferralDto, TrackReferralDto } from './dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Referrals')
@Controller('referrals')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  // Generate a referral link for a specific event
  @Post()
  async createReferral(@Body() data: CreateReferralDto) {
    return await this.referralService.createReferral(data);
  }

  // Track referral usage
  @Post('track')
  async trackReferral(@Body() data: TrackReferralDto) {
    return await this.referralService.trackReferral(
      data.referralLink,
      data.referredId,
    );
  }

  // Get all referrals made by a specific user
  @Get(':referrerId')
  async getUserReferrals(@Param('referrerId') referrerId: string) {
    return await this.referralService.getUserReferrals(parseInt(referrerId));
  }
}
