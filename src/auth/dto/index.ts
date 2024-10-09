import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty({ required: false })
  @IsString()
  username: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  last_name?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  photo_url?: string;
}
