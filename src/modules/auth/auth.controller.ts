/**
 * @file Auth controller
 * @module modules/auth/controller
 * @author Name6
 */

import { Body, Controller, Post, HttpStatus, Get, Req, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthUserInfoPayload,
  EmailInfo,
  ImageCaptchaPayload,
  RegisterInfoPayload,
} from './auth.model';
import { HttpProcessor } from '@/common/decorators/http.decorator';
import { TokenResult } from './auth.interface';
import { Authorize } from '@/common/decorators/authorize.decorator';
import { RequestUser } from '@/interfaces/req-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Authorize()
  @HttpProcessor.handle({ message: 'Register', error: HttpStatus.BAD_REQUEST })
  register(@Body() body: RegisterInfoPayload): Promise<boolean> {
    return this.authService.register(body);
  }

  @Post('login')
  @Authorize()
  @HttpProcessor.handle({ message: 'Login', error: HttpStatus.BAD_REQUEST })
  async login(@Body() body: AuthUserInfoPayload): Promise<TokenResult> {
    const { email, password, captchaId, verifyCode } = body;
    await this.authService.checkCaptcha(captchaId, verifyCode);
    const res = await this.authService.adminLogin(email, password);
    return res;
  }

  @Get('refreshToken')
  @HttpProcessor.handle({ message: 'Refresh token' })
  refreshToken(@Req() req): TokenResult {
    const { id, username } = req.user as RequestUser;
    const token = this.authService.createToken(id, username);
    return token;
  }

  @Get('captcha/img')
  @Authorize()
  @HttpProcessor.handle({
    message: 'Captcha',
    error: HttpStatus.BAD_REQUEST,
  })
  captcha(@Query() size: ImageCaptchaPayload) {
    return this.authService.getCaptcha(size);
  }

  @Post('captcha/code')
  @Authorize()
  @HttpProcessor.handle({ message: 'Send email', error: HttpStatus.BAD_REQUEST })
  code(@Body() { email }: EmailInfo) {
    return this.authService.sendCode(email);
  }
}