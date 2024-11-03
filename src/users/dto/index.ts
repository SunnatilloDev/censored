import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
  id?: number;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  telegramId: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  firstName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isSubscribed?: boolean;
}

export class UpdateUserDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  photo_url?: string; // For profile photo URL

  @ApiProperty()
  @IsString()
  @IsOptional()
  profileHeader?: string; // New field for profile header

  @ApiProperty()
  @IsString()
  @IsOptional()
  about?: string; // New field for "about you" information

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isSubscribed?: boolean;
}
