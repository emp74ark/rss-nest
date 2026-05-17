import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { MongoServerError } from 'mongodb';

enum MongoErrorCode {
  DUPLICATE_KEY = 11000,
}

@Catch(MongoServerError)
export class MongooseExceptionFilter implements ExceptionFilter {
  catch(exception: MongoServerError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<any>();
    if (exception.code === MongoErrorCode.DUPLICATE_KEY) {
      response.status(HttpStatus.CONFLICT).send({
        message: 'Duplicate key',
        error: 'Conflict',
        statusCode: HttpStatus.CONFLICT,
      });
    }
  }
}
