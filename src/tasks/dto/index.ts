import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['General', 'PromoCode'])
  type: 'General' | 'PromoCode';

  @IsOptional()
  @IsDateString()
  openingDate?: string;

  @IsNotEmpty()
  airdropId: number;
}

export class UpdateTaskStatusDto {
  @IsNotEmpty()
  userId: number;

  @IsBoolean()
  isCompleted: boolean;
}
