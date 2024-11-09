// src/advertisements/dto/create-advertisement.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdvertisementDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  redirectUrl: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty()
  @IsDateString()
  startDate: string;
  @ApiProperty()
  @IsDateString()
  endDate: string;
}

export class UpdateAdvertisementDto {
  @IsOptional()
  @ApiProperty()
  @IsString()
  imageUrl?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  redirectUrl?: string;

  @IsOptional()
  @ApiProperty()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @ApiProperty()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @ApiProperty()
  @IsDateString()
  endDate?: string;
}
