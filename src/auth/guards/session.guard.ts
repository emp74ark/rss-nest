import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestWithSession } from '../../shared/entities/session.types';

@Injectable()
export class SessionGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { session } = context.switchToHttp().getRequest<RequestWithSession>();
    return !!session?.user;
  }
}
