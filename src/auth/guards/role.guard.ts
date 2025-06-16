import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { Role } from '../../shared/enums';
import { RequiredRole } from '../decorators';
import { User } from '../../schemas/user.schema';

declare module 'express-session' {
  interface SessionData {
    user?: User & { _id: string };
  }
}

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflect: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const {
      session: { user },
    } = context.switchToHttp().getRequest<Request>();

    const requiredRole = this.reflect?.getAllAndOverride<Role>(RequiredRole, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!user || !user.role) return false;

    return user?.role === requiredRole;
  }
}
