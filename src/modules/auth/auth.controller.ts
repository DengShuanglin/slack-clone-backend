/**
 * @file Auth controller
 * @module modules/auth/controller
 * @author Name6
 */

import type { Request } from 'express';
import type { TokenResult } from './auth.interface';
import type { RequestUser } from '@/interfaces/req-user.interface';

import {
  Body,
  Controller,
  Post,
  HttpStatus,
  Get,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthUserInfoPayload,
  EmailInfo,
  ImageCaptchaPayload,
  RegisterInfoPayload,
} from './auth.model';
import { HttpProcessor } from '@/common/decorators/http.decorator';
import { JwtAuthGuard } from '@/common/guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpProcessor.handle({ message: 'Register', error: HttpStatus.BAD_REQUEST })
  register(@Body() body: RegisterInfoPayload): Promise<boolean> {
    return this.authService.register(body);
  }

  @Post('login')
  @HttpProcessor.handle({ message: 'Login', error: HttpStatus.BAD_REQUEST })
  async login(@Body() body: AuthUserInfoPayload): Promise<TokenResult> {
    const { email, password, captchaId, verifyCode } = body;
    await this.authService.checkCaptcha(captchaId, verifyCode);
    const res = await this.authService.adminLogin(email, password);
    return res;
  }

  @Get('refreshToken')
  @UseGuards(JwtAuthGuard)
  @HttpProcessor.handle({ message: 'Refresh token', error: 2000 })
  refreshToken(@Req() req: Request): TokenResult {
    const { id, email } = req.user as RequestUser;
    const token = this.authService.createToken(id, email);
    return token;
  }

  @Get('captcha/img')
  @HttpProcessor.handle({
    message: 'Captcha',
    error: HttpStatus.BAD_REQUEST,
  })
  captcha(@Query() size: ImageCaptchaPayload) {
    return this.authService.getCaptcha(size);
  }

  @Post('captcha/code')
  @HttpProcessor.handle({ message: 'Send email', error: HttpStatus.BAD_REQUEST })
  code(@Body() { email }: EmailInfo) {
    return this.authService.sendCode(email);
  }
}
