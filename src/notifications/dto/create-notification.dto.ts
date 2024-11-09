import { IsArray, IsDate, IsEnum, IsString } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateNotificationDto {
  @IsString()
  type: string;

  @IsDate()
  endDate: Date;

  @IsArray()
  @IsEnum(Role, { each: true }) // Ensures each role is a valid Role enum value
  recipientRoles: Role[];

  @IsString()
  message: string;
}
