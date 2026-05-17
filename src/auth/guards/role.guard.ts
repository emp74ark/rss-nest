import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { RequestWithSession, Role } from '../../shared/entities';
import { RequiredRole } from '../decorators';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflect: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { session } = context.switchToHttp().getRequest<RequestWithSession>();
    const user = session?.user;

    const requiredRole = this.reflect?.getAllAndOverride<Role>(RequiredRole, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!user || !user.role) return false;

    return user?.role === requiredRole;
  }
}
