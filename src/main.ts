/**
 * @file App entry
 * @module app/main
 * @author Name6
 */

import passport from 'passport';
import bodyParser from 'body-parser';
import compression from 'compression';
import { AppModule } from '@/app.module';
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@/common/pipes/validation.pipe';
import { HttpExceptionFilter } from '@/common/filters/error.filter';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';
import { ErrorInterceptor } from '@/common/interceptors/error.interceptor';
import { environment, isProdEnv } from '@/app.environment';
import logger from '@/utils/logger';
import * as APP_CONFIG from '@/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, isProdEnv ? { logger: false } : {});
  app.setGlobalPrefix('api');
  app.use(compression());
  app.use(bodyParser.json({ limit: '1mb' }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(passport.initialize());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(
    new TransformInterceptor(new Reflector()),
    new ErrorInterceptor(new Reflector()),
    new LoggingInterceptor(),
  );
  return await app.listen(APP_CONFIG.APP.PORT);
}

bootstrap().then(() => {
  logger.info(`SlackAPI run! port at ${APP_CONFIG.APP.PORT}, env: ${environment}`);
});
