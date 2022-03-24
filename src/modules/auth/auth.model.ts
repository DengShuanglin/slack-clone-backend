/**
 * @file Auth & admin model
 * @module modules/auth/model
 * @author Name6
 */

import { prop } from '@typegoose/typegoose';
import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class AuthUserInfoPayload {
  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Length(6, 16)
  password: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  captchaId: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  verifyCode: string;
}

export class ImageCaptchaPayload {
  @IsOptional()
  @IsString()
  @prop({ set: (val: string) => Number(val), get: (val: number) => Number(val) })
  readonly width: number;

  @IsOptional()
  @IsString()
  readonly height: number;
}

export class RegisterInfoPayload {
  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Length(6, 16)
  password: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  verifyCode: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  codeId: string;
}

export class EmailInfo {
  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
