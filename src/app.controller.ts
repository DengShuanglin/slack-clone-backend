/**
 * @file App controller
 * @module src/controller
 * @author Name6
 */

import { Controller, Get } from '@nestjs/common';
import * as APP_CONFIG from './app.config';

@Controller()
export class AppController {
  @Get()
  root() {
    return APP_CONFIG.PROJECT;
  }
}
