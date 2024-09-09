import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateArticleDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsNumber()
  createdBy: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  publishDate?: string;
}

export class UpdateArticleDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  content?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  publishDate?: string;
}
