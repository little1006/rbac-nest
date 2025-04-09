import { HttpException, HttpStatus } from '@nestjs/common';
import { ResService } from 'src/res/res.service';

export class BusinessException extends HttpException {
  constructor(message: string, statusCode: string, error: any = null) {
    super(
      {
        statusCode,
        message,
        error,
      },
      HttpStatus.OK, // 是成功的
    );
  }
}
