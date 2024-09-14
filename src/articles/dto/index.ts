import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateArticleDto {
  @ApiProperty()
  title: string;
  @ApiProperty()
  subtitle: string;
  @ApiProperty()
  content: string;
  @ApiProperty()
  @IsOptional()
  conclusion: string;
  @ApiProperty()
  createdBy: number;
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
