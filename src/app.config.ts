/**
 * @file App config
 * @module app/config
 * @author Name6
 */

import path from 'path';
import { argv } from 'yargs';

const ROOT_PATH = path.join(__dirname, '..');
const packageJSON = require(path.resolve(ROOT_PATH, 'package.json'));

export const APP = {
  PORT: 3000,
  ROOT_PATH,
  DEFAULT_CACHE_TTL: 60 * 60 * 24,
  MASTER: 'Name6',
  NAME: 'slack-backend',
  ADMIN_EMAIL: '1871731528@qq.com',
};

export const PROJECT = {
  name: packageJSON.name,
  version: packageJSON.version,
  author: packageJSON.author,
};

export const CROSS_DOMAIN = {
  allowedOrigins: [],
  allowedReferer: '',
};

export const MONGO_DB = {
  uri: `mongodb://${argv.dbhost || ''}:${argv.dbport || '27017'}/slack`,
  username: argv.db_username || '',
  password: argv.db_password || '',
};

export const REDIS = {
  host: argv.redis_host || '',
  port: argv.redis_port || 6379,
  username: (argv.redis_username || null) as string,
  password: (argv.redis_password || '') as string,
};

export const AUTH = {
  expiresIn: argv.auth_expires_in || 3600,
  refreshExpiresIn: argv.auth_refresh_expires_in || 3600 * 24 * 5,
  jwtTokenSecret: argv.auth_key || 'slack',
  defaultPassword: argv.auth_default_password || '123456',
};

export const EMAIL = {
  account: argv.email_account || '1871731528@qq.com',
  password: argv.email_password || '',
};
