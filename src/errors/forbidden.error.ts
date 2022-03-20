/**
 * @file 403 HttpForbidden error
 * @module error/forbidden
 * @author Name6
 */

import { HttpException, HttpStatus } from '@nestjs/common';
import * as TEXT from '@/constants/text.constant';

/**
 * @class HttpForbiddenError
 * @classdesc 403 -> 无权限/权限不足
 * @example new HttpForbiddenError('错误信息')
 * @example new HttpForbiddenError(new Error())
 */
export class HttpForbiddenError extends HttpException {
  constructor(error?: any) {
    super(error || TEXT.HTTP_PARAMS_PERMISSION_ERROR_DEFAULT, HttpStatus.FORBIDDEN);
  }
}
