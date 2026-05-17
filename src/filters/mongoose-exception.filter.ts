import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { MongoServerError } from 'mongodb';
import { FastifyLikeResponse } from '../shared/entities/session.types';

enum MongoErrorCode {
  DUPLICATE_KEY = 11000,
}

@Catch(MongoServerError)
export class MongooseExceptionFilter implements ExceptionFilter {
  catch(exception: MongoServerError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyLikeResponse>();
    if (exception.code === MongoErrorCode.DUPLICATE_KEY) {
      void response.status(HttpStatus.CONFLICT).send({
        message: 'Duplicate key',
        error: 'Conflict',
        statusCode: HttpStatus.CONFLICT,
      });
    }
  }
}
