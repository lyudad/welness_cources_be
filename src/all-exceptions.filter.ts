import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let messageBody: any = { message: 'Internal server error' };

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      messageBody = exception.getResponse();
    } else if (exception instanceof Error) {
      httpStatus = HttpStatus.BAD_REQUEST;
      messageBody.message = exception.message || 'Bad request';
    }

    const responseBody = {
      statusCode: httpStatus,
      ...messageBody,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
