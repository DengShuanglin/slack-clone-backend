/**
 * @file Auth jwt strategy
 * @module modules/auth/jwt-strategy
 * @author Name6
 */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as APP_CONFIG from '@/app.config';
import { AuthService } from './auth.service';
import { HttpUnauthorizedError } from '@/errors/unauthorized.error';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: APP_CONFIG.AUTH.jwtTokenSecret,
    });
  }

  validate(payload: any) {
    const data = this.authService.validateAuthData(payload);
    if (data) return data;
    else throw new HttpUnauthorizedError();
  }
}
