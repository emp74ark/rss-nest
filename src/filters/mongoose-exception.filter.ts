import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { MongoServerError } from 'mongodb';
import { Response } from 'express';

enum MongoErrorCode {
  DUPLICATE_KEY = 11000,
}

@Catch(MongoServerError)
export class MongooseExceptionFilter implements ExceptionFilter {
  catch(exception: MongoServerError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();
    if (exception.code === MongoErrorCode.DUPLICATE_KEY) {
      response.status(409).json({
        message: 'Duplicate key',
      });
    }
  }
}
