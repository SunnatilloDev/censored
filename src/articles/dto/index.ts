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

class ContentBlockDto {
  @ApiProperty({ example: 'text' })
  @IsString()
  @IsIn(['text', 'image', 'video'])
  type: string;

  @ApiProperty({ required: false, example: 'This is some text content.' })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiProperty({ required: false, example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiProperty({
    required: false,
    example: '16px',
    description: 'Font size for text content',
  })
  @IsOptional()
  @IsString()
  fontSize?: string;

  @ApiProperty({
    required: false,
    example: true,
    description: 'Is the text bold?',
  })
  @IsOptional()
  @IsBoolean()
  bold?: boolean;

  @ApiProperty({
    required: false,
    example: true,
    description: 'Is the text italic?',
  })
  @IsOptional()
  @IsBoolean()
  italic?: boolean;

  @ApiProperty({
    required: false,
    example: '#333',
    description: 'Text color in hex',
  })
  @IsOptional()
  @IsString()
  color?: string;
}

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

  @ApiProperty({
    description: 'Content blocks (text, image, video)',
    isArray: true,
    type: ContentBlockDto,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentBlockDto)
  content: ContentBlockDto[];

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
  @IsUrl({}, { each: true })
  mediaUrls?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];

  @ApiProperty({ required: false })
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
    description: 'Updated content blocks (text, image, video)',
    isArray: true,
    type: ContentBlockDto,
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ContentBlockDto)
  content?: ContentBlockDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  publishDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  categories?: number[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
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