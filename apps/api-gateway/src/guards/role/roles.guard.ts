import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Step 1: Get the roles required for this specific endpoint from the @Roles decorator.
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If the endpoint has no @Roles decorator, allow access.
    if (!requiredRoles) {
      return true;
    }

    // Step 2: Get the user object that our AuthGuard previously attached to the request.
    const { user } = context.switchToHttp().getRequest();

    // Step 3: Check if the user's role is included in the list of required roles.
    return requiredRoles.some((role) => user?.role === role);
  }
}