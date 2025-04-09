import { Injectable } from '@nestjs/common';

@Injectable()
export class ResService {
  // 代码
  static CODES = {
    Success: '000000', // 成功
    BadRequest: '000400', // 请求参数错误
    InternalError: '000500', // 服务器内部错误
  };

  private json({ code, msg, data }) {
    return {
      code,
      msg,
      data,
    };
  }

  success(data: any, msg = 'success') {
    return this.json({
      code: ResService.CODES.Success,
      msg: msg,
      data: data,
    });
  }

  error(code: string, msg = '', data = null) {
    return this.json({
      code,
      msg,
      data,
    });
  }

  catchError(msg: string) {
    return this.error('500', msg);
  }
}
