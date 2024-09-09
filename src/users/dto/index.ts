import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
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

  @IsString()
  @ApiProperty()
  @IsOptional()
  firstName?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  lastName?: string;

  @IsBoolean()
  @ApiProperty()
  @IsOptional()
  isSubscribed?: boolean;
}
