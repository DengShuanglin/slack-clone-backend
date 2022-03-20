/**
 * @file Database providers > mongoose connection
 * @module processor/database/providers
 * @author Name6
 */

import mongoose from 'mongoose';
import { EmailService } from '@/processors/helper/email.service';
import { DB_CONNECTION_TOKEN } from '@/constants/system.constant';
import * as APP_CONFIG from '@/app.config';
import logger from '@/utils/logger';

export const databaseProvider = {
  inject: [EmailService],
  provide: DB_CONNECTION_TOKEN,
  useFactory: async (emailService: EmailService) => {
    let reconnectionTask: NodeJS.Timeout | null = null;
    const RECONNECT_INTERVAL = 6000;

    // 发送告警邮件
    const sendAlarmMail = (error: string) => {
      emailService.sendMailAs(APP_CONFIG.APP.NAME, {
        to: APP_CONFIG.APP.ADMIN_EMAIL,
        subject: `MongoDB Error!`,
        text: error,
        html: `<pre><code>${error}</code></pre>`,
      });
    };

    function connection() {
      return mongoose.connect(APP_CONFIG.MONGO_DB.uri, {
        user: APP_CONFIG.MONGO_DB.username as string,
        pass: APP_CONFIG.MONGO_DB.password as string,
        authSource: 'admin',
      });
    }

    mongoose.connection.on('connecting', () => {
      logger.info('[MongoDB]', 'connecting...');
    });

    mongoose.connection.on('open', () => {
      logger.info('[MongoDB]', 'readied!');
      if (reconnectionTask) {
        clearTimeout(reconnectionTask);
        reconnectionTask = null;
      }
    });

    mongoose.connection.on('disconnected', () => {
      logger.error(
        '[MongoDB]',
        `disconnected! retry when after ${RECONNECT_INTERVAL / 1000}s`,
      );
      reconnectionTask = setTimeout(connection, RECONNECT_INTERVAL);
    });

    mongoose.connection.on('error', (error) => {
      logger.error('[MongoDB]', 'error!', error);
      mongoose.disconnect();
      sendAlarmMail(String(error));
    });

    return await connection();
  },
};
