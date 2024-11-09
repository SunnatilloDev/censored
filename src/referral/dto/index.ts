// src/referrals/dto/create-referral.dto.ts
import { IsNumber, IsString } from 'class-validator';

export class CreateReferralDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  eventId: number; // Event ID for referral
}

export class TrackReferralDto {
  @IsString()
  referralLink: string;

  @IsNumber()
  referredId: number;
}
