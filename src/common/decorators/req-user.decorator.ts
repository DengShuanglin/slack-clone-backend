/**
 * @file Get request user
 * @module /decorators/req-user
 * @author Name6
 */

import { RequestUser } from '@/interfaces/req-user.interface';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ReqUser = createParamDecorator(
  (data: 'id' | 'username' | 'role', context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as RequestUser;
    return data ? user[data] : user;
  },
);
