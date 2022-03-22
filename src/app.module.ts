/**
 * @file App module
 * @module app/module
 * @author Name6
 */

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './processors/database/database.module';
import { HelperModule } from './processors/helper/helper.module';
import { CacheModule } from './processors/cache/cache.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/auth.guard';

@Module({
  imports: [DatabaseModule, HelperModule, CacheModule, AuthModule, UserModule],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
