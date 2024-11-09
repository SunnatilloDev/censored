import {
  IsString,
  IsDateString,
  IsBoolean,
  IsNumber,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAirdropDto {
  @IsString()
  @ApiProperty()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;
  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiProperty()
  @IsNumber()
  prizePool: number;

  @ApiProperty()
  @IsArray()
  tasks: {
    name: string;
    description: string;
    type?: string; // Optional type
    openingDate?: Date; // Optional openingDate
  }[];
}

export class ParticipateAirdropDto {
  @ApiProperty()
  @IsNumber()
  userId: number;
}
