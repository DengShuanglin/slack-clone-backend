/**
 * @file Auth service
 * @module modules/auth/servcie
 * @author Name6
 */

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { encodeMD5 } from '@/common/transformers/codec.transformer';
import { nanoid } from 'nanoid';
import * as svgCaptcha from 'svg-captcha';
import * as APP_CONFIG from '@/app.config';
import { CodeResult, TokenResult } from './auth.interface';
import { UserService } from '../user/user.service';
import { CacheService } from '@/processors/cache/cache.service';
import { EmailService } from '@/processors/helper/email.service';
import { ImageCaptchaPayload, RegisterInfoPayload } from './auth.model';
import { isEmpty } from 'lodash';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly cacheService: CacheService,
    private readonly emailService: EmailService,
  ) {}

  public createToken(id: string, email: string): TokenResult {
    return {
      access_token: this.jwtService.sign({ id, email }),
      refresh_token: this.jwtService.sign(
        { id, email },
        { expiresIn: APP_CONFIG.AUTH.refreshExpiresIn as number },
      ),
    };
  }

  public validateAuthData(payload: any) {
    return payload.id && payload.email ? payload : null;
  }

  public async register({ verifyCode, codeId, password, email }: RegisterInfoPayload) {
    const code = await this.cacheService.get<string>(`admin:captcha:code:${codeId}`);
    if (code !== verifyCode) throw '验证码错误或失效！';
    const isExist = await this.userService.isExist(email);
    if (isExist) throw '该用户已存在！';
    this.userService.createOne({ email, password: encodeMD5(password) });
    return true;
  }

  public async adminLogin(email: string, password: string): Promise<TokenResult> {
    const user = await this.userService.findOne({ email });
    const existedPassword = user.password;
    const loginPassword = encodeMD5(password);
    if (loginPassword === existedPassword) {
      const token = this.createToken(user.id as unknown as string, user.email);
      return { ...token };
    } else throw 'Password incorrect';
  }

  /**
   * 获取验证码
   * @param size img size
   * @returns img + id
   */
  public async getCaptcha(size: ImageCaptchaPayload) {
    const svg = svgCaptcha.create({
      size: 4,
      color: true,
      noise: 4,
      width: isEmpty(size.width) ? 100 : size.width,
      height: isEmpty(size.height) ? 50 : size.height,
      charPreset: '1234567890',
    });
    const ret = {
      img: `data:image/svg+xml;base64,${Buffer.from(svg.data).toString('base64')}`,
      id: nanoid(),
    };
    await this.cacheService.set(`admin:captcha:img:${ret.id}`, svg.text, { ttl: 5 * 60 });
    return ret;
  }

  /**
   * 验证码校验
   * @param id captcha Id
   * @param code cpatcha
   */
  public async checkCaptcha(id: string, code: string): Promise<void> {
    const ret = await this.cacheService.get<string>(`admin:captcha:img:${id}`);
    if (isEmpty(ret) || code.toLowerCase() !== ret.toLowerCase()) {
      throw '验证码错误';
    }
    await this.cacheService.delete(`admin:captcha:img:${id}`);
  }

  /**
   * 注册发送邮箱验证码
   * @param email
   * @returns Code Id
   */
  public async sendCode(email: string): Promise<CodeResult> {
    let verifyCode = '';
    for (let i = 0; i < 6; i++) {
      verifyCode += Math.floor(Math.random() * 10);
    }
    const ret = { codeId: nanoid() };

    await this.cacheService.set(`admin:captcha:code:${ret.codeId}`, verifyCode, {
      ttl: 60 * 5,
    });
    const time = new Date();
    const years = time.getFullYear(),
      months = time.getMonth() + 1,
      days = time.getDate(),
      hours = time.getHours(),
      minutes = time.getMinutes() + 1,
      seconds = time.getSeconds();
    this.emailService.sendMailAs(APP_CONFIG.APP.NAME, {
      to: email,
      subject: '注册信息确认',
      text: '',
      html: `<div style="border: 1px solid #dcdcdc;color: #676767;width: 600px; margin: 0 auto; padding-bottom: 50px;position: relative;">
        <div style="height: 60px; background: #393d49; line-height: 60px; color: #58a36f; font-size: 18px;padding-left: 10px;">简单聊——欢迎注册</div>
        <div style="padding: 25px">
          <div>亲爱的用户您好，验证码有效时间为1分钟，请在<span style="border-bottom:1px dashed #ccc;">${years}-${months}-${days}</span> ${hours}:${minutes}:${
        seconds < 10 ? '0' + seconds : seconds
      }之前输入验证码进行注册：</div>
          <span style="padding: 10px 20px; color: #fff; display: inline-block; background: #009e94; margin: 15px 0;text-decoration: none;">${verifyCode}</span>
          <div style="padding: 5px; background: #f2f2f2;">如果该邮件不是由你本人操作，请勿进行激活！否则你的邮箱将会被他人绑定。</div>
        </div>
        <div style="background: #fafafa; color: #b4b4b4;text-align: center; line-height: 45px; height: 45px; position: absolute; left: 0; bottom: 0;width: 100%;">系统邮件，请勿直接回复</div>
    </div>`,
    });
    return ret;
  }
}
