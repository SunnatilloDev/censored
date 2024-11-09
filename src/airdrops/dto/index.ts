import {
  IsString,
  IsDateString,
  IsBoolean,
  IsNumber,
  IsArray,
} from 'class-validator';

export class CreateAirdropDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  prizePool: number;

  @IsArray()
  tasks: {
    name: string;
    description: string;
    type?: string; // Optional type
    openingDate?: Date; // Optional openingDate
  }[];
}

export class ParticipateAirdropDto {
  @IsNumber()
  userId: number;
}
