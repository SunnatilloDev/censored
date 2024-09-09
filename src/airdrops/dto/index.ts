import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsISO8601,
} from 'class-validator';

export class CreateAirdropDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: new Date('2019-02-29') })
  @IsISO8601()
  startDate?: string;

  @ApiProperty({ example: new Date('2019-02-29') })
  @IsISO8601()
  endDate: string;

  @IsNumber()
  @ApiProperty()
  prizePool: number;
}

export class UpdateAirdropDto {
  @IsString()
  @ApiProperty()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @ApiProperty()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: '2020-12-12' })
  @IsISO8601()
  @IsOptional()
  startDate?: string;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @ApiProperty()
  @IsOptional()
  prizePool?: number;
}
