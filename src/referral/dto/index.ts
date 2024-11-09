// src/referrals/dto/create-referral.dto.ts
import { IsInt, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReferralDto {
  @ApiProperty({
    description: 'ID of the user creating the referral',
    example: 1,
  })
  @IsInt()
  userId: number;

  @ApiProperty({ description: 'ID of the event or airdrop', example: 10 })
  @IsInt()
  eventId: number;
}
export class TrackReferralDto {
  @ApiProperty({
    description: 'Unique referral link to track',
    example: 'abcdef1234',
  })
  @IsString()
  referralLink: string;

  @ApiProperty({ description: 'ID of the referred user', example: 5 })
  @IsInt()
  referredId: number;
}
