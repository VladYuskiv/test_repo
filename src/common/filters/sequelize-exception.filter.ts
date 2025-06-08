import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Error as SequelizeError } from 'sequelize';
import { HttpAdapterHost } from '@nestjs/core';

@Catch(SequelizeError)
export class SequelizeExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('SequelizeExceptionFilter');

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: SequelizeError, host: ArgumentsHost) {
    this.logger.error(`A database error occurred: ${exception.message}`, {
      ...exception,
    });

    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const responseBody = {
      message: 'An unexpected error occurred with the database.',
      error: 'Internal Server Error',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    };

    httpAdapter.reply(
      ctx.getResponse(),
      responseBody,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
