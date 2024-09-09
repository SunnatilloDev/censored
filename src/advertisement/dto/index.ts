import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class CreateAdvertisementDto {
  @IsString()
  @ApiProperty({ example: 'https://example.com/image.jpg' })
  imageUrl: string;

  @ApiProperty({ example: 'https://example.com' })
  @IsString()
  redirectUrl: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: '2024-09-01T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-10-01T00:00:00.000Z' })
  @IsDateString()
  endDate: string;
}

export class UpdateAdvertisementDto {
  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: 'https://example.com', required: false })
  @IsString()
  @IsOptional()
  redirectUrl?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: '2024-09-01T00:00:00.000Z', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ example: '2024-10-01T00:00:00.000Z', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
