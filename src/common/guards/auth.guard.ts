/**
 * @file JwtAuth guard and permission authorize
 * @module guard/auth
 * @author Name6
 */

import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { HttpUnauthorizedError } from '@/errors/unauthorized.error';
import { UNDEFINED } from '@/constants/value.constant';
import { Reflector } from '@nestjs/core';
import { AUTHORIZE_KEY_METADATA } from '@/constants/meta.constant';

/**
 * @class JwtAuthGuard
 * @classdesc 检验规则：Token 是否存在 -> Token 是否在有效期内 -> Token 解析出的数据是否对的上
 * @example ```@UseGuards(JwtAuthGuard)```
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    // 如果加入@Authorize则跳过校验
    const authorize = this.reflector.get<boolean>(
      AUTHORIZE_KEY_METADATA,
      context.getHandler(),
    );

    if (authorize) return true;
    return super.canActivate(context);
  }

  /**
   * @method handleRequest
   * @description 如果解析出的数据对不上，则判定为无效，并进行权限验证
   */
  handleRequest(error, authInfo, errInfo) {
    if (authInfo && !error && !errInfo) {
      return authInfo;
    } else {
      throw error || new HttpUnauthorizedError(UNDEFINED, errInfo?.message);
    }
  }
}
