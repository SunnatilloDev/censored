import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ReferralService } from './referral.service';

@Controller('referrals')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Post(':referrerId')
  async createReferral(@Param('referrerId') referrerId: string) {
    return await this.referralService.createReferral(parseInt(referrerId));
  }

  @Post('track')
  async trackReferral(
    @Body() body: { referralLink: string; referredId: number },
  ) {
    return await this.referralService.trackReferral(
      body.referralLink,
      body.referredId,
    );
  }

  @Get(':referrerId')
  async getUserReferrals(@Param('referrerId') referrerId: string) {
    return await this.referralService.getUserReferrals(parseInt(referrerId));
  }
}
