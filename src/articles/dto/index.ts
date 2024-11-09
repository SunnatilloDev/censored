import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsDateString,
  IsInt,
  IsArray,
  IsUrl,
  IsIn,
  IsBoolean,
  Min,
  Max,
  ValidateNested,
  IsObject,
  IsISO8601,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateArticleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  subtitle?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  conclusion?: string;

  @ApiProperty({ required: false, example: '2023-09-20' })
  @IsOptional()
  @IsDateString()
  publishDate?: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  authorId: number;

  @ApiProperty({ example: 'Draft' })
  @IsString()
  @IsIn(['Draft', 'Published', 'Archived'])
  status: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  mediaUrls?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  tags?: number[];

  @ApiProperty({ required: false, example: [1, 2, 3] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  categories?: number[];
}

export class UpdateArticleDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    required: false,
  })
  @IsArray()
  @IsOptional()
  content?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  publishDate?: string;

  @ApiProperty({ required: false, example: [1, 2, 3] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  categories?: number[];

  @ApiProperty({ required: false, example: [1, 2, 3] })
  @IsOptional()
  @IsArray()
  tags?: number[];
}

export class RateArticleDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  userId: number;
}

export class ReportScamDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  reportedById: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  proof?: string;
}
