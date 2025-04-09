import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ResService } from 'src/res/res.service';
import { BusinessException } from './BusinessException';

@Catch()
export class ErrorHandlerFilter<T> implements ExceptionFilter {
  constructor(private readonly res: ResService) {}

  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let errors = null;

    let code = ResService.CODES.InternalError;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // 如果是 HttpException，则提取状态码和错误信息
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // 处理 class-validator 的验证错误
      if (exception instanceof BadRequestException) {
        status = HttpStatus.OK;
        code = ResService.CODES.BadRequest;
        const validationErrors = (exceptionResponse as any).message || [];
        errors = validationErrors;
        message = '请求参数验证失败';
      } else if (exception instanceof BusinessException) {
        status = HttpStatus.OK;
        const exceptionResponse = exception.getResponse();
        code = (exceptionResponse as any).statusCode;
        message = (exceptionResponse as any).message;
        errors = (exceptionResponse as any).error;
      } else {
        message =
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse as any).message || message;
        errors = exception.message;
      }
    } else {
      console.log('什么？没拦截住？');
      console.log('exception', exception);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      errors = exception?.message;
    }

    // 返回统一的错误响应格式
    response.status(status).json(this.res.error(code, message, errors));
  }
}
