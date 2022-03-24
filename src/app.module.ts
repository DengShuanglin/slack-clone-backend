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
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [DatabaseModule, HelperModule, CacheModule, AuthModule, UserModule, ChatModule],
  controllers: [AppController],
})
export class AppModule {}
