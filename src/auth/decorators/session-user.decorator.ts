import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../schemas/user.schema';

export const SessionUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: {
      session: { user?: User & { _id: string } };
    } = ctx.switchToHttp().getRequest();
    return request.session.user?._id;
  },
);
