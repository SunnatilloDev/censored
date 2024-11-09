// src/notifications/dto/create-notification.dto.ts
import { Role } from '@prisma/client';

export class CreateNotificationDto {
  type: string;
  endDate: Date;
  recipientRoles: Role[];
  message: string;
}
