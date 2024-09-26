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
} from 'class-validator';

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  publishDate?: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  authorId: number;

  @ApiProperty()
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
