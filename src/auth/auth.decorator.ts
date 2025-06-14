import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const GetSessionUserId = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const session = request.session;
    if (
      'user' in session &&
      typeof session.user === 'object' &&
      session.user !== null
    ) {
      if ('_id' in session.user) {
        return session.user._id;
      }
    }
    return null;
  },
);
