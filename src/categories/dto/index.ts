import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  icon: string;
}

export class UpdateCategoryDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;
}
