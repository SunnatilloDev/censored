import { IsNotEmpty, IsOptional, IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  name: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  description?: string;
  @ApiProperty()
  @IsOptional()
  @IsInt()
  articleId?: number; // Optional field to link the tag to an article
}
