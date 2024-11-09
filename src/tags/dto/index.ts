import { IsNotEmpty, IsOptional, IsInt, IsString } from 'class-validator';

export class CreateTagDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  articleId?: number; // Optional field to link the tag to an article
}
