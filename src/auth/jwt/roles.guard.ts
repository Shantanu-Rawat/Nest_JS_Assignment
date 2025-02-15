import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the required roles from metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are specified, allow access by default
    if (!requiredRoles) {
      return true;
    }

    // Extract the user from the request object
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      return false; // No user or role found, deny access
    }

    // Check if the user has at least one of the required roles
    return requiredRoles.some((role) => user.role.includes(role));
  }
}
