/**
 * @file Dev logging interceptor
 * @module interceptor/logging
 * @author Name6
 */

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  Injectable,
  NestInterceptor,
  CallHandler,
  ExecutionContext,
} from '@nestjs/common';
import { isDevEnv } from '@/app.environment';
import logger from '@/utils/logger';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const call$ = next.handle();
    if (!isDevEnv) {
      return call$;
    }
    const request = context.switchToHttp().getRequest();
    const content = request.method + ' -> ' + request.url;
    logger.debug('+++ req: ', content);
    const now = Date.now();
    return call$.pipe(
      tap(() => logger.debug('--- res: ', content, `${Date.now() - now}ms`)),
    );
  }
}
