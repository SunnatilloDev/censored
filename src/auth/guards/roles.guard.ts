import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../roles.enum';
import { Roles } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(Roles, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required, proceed with access
    }

    const { user } = context.switchToHttp().getRequest();

    // Allow `OWNER` role full access without checking required roles
    if (user.role === Role.OWNER) {
      return true;
    }

    // Check if the user has one of the required roles
    const hasRole = requiredRoles.some((role) => role === user.role);
    if (!hasRole) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
