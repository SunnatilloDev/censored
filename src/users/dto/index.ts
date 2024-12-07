import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { Role } from '../enums/role.enum'; 

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

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isSubscribed?: boolean;
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isBlocked?: boolean;
}
