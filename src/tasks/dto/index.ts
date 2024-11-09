// src/tasks/dto/create-task.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ description: 'The title of the task' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Detailed description of the task' })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Type of task (e.g., "PromoCode" or "Quiz")',
    enum: ['PromoCode', 'Quiz'],
  })
  @IsString()
  type: string;

  @ApiPropertyOptional({
    description: 'Date and time when the task opens for participation',
  })
  @IsOptional()
  @IsDateString()
  openingDate?: string;

  @ApiProperty({ description: 'The ID of the associated airdrop' })
  airdropId: number;

  // Fields specific to Promo Code task
  @ApiPropertyOptional({
    description: 'The required promo code to complete the task',
  })
  @IsOptional()
  @IsString()
  promoCode?: string;

  // Fields specific to Quiz task
  @ApiPropertyOptional({ description: 'The question for the quiz task' })
  @IsOptional()
  @IsString()
  question?: string;

  @ApiPropertyOptional({
    description: 'List of answer options for the quiz task',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  options?: string[];

  @ApiPropertyOptional({
    description: 'The correct answer for the quiz question',
  })
  @IsOptional()
  @IsString()
  correctAnswer?: string;
}

export class UpdateTaskStatusDto {
  @ApiProperty({
    description: 'The ID of the user completing the task',
    example: 1,
  })
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'Completion status of the task (true if completed)',
    example: true,
  })
  @IsBoolean()
  isCompleted: boolean;
}
