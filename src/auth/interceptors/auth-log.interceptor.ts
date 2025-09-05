import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class AuthLogInterceptor implements NestInterceptor {
  interceptorLogger = new Logger('AuthLogInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req: Request = ctx.getRequest();
    return next.handle().pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpException) {
          this.interceptorLogger.warn(
            `Unauthorized request from ${req.ip} for ${req.originalUrl}`,
          );
        } else {
          this.interceptorLogger.error(error);
        }
        return throwError(() => error);
      }),
    );
  }
}
