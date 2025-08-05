import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Pagination } from '../entities';

export const GetPaginationArgs = createParamDecorator(
  (data: unknown, context: ExecutionContext): Pagination => {
    const request: {
      query: {
        pageNumber: string;
        perPage: string;
      };
    } = context.switchToHttp().getRequest();
    return {
      pageNumber: parseInt(request?.query?.pageNumber) || 1,
      perPage: parseInt(request?.query?.perPage) || 10,
    };
  },
);
