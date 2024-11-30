import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;
      
      message = typeof exceptionResponse === 'object' 
        ? exceptionResponse.message || message
        : exceptionResponse;
      
      error = typeof exceptionResponse === 'object'
        ? exceptionResponse.error || error
        : 'Error';
    }

    // Log the error with context
    this.logger.error({
      path: request.url,
      method: request.method,
      status,
      message,
      error,
      timestamp: new Date().toISOString(),
      ...(exception.stack ? { stack: exception.stack } : {}),
    });

    response.status(status).json({
      statusCode: status,
      message: Array.isArray(message) ? message : [message],
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
