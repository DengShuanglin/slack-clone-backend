/**
 * @file Auth & admin model
 * @module modules/auth/model
 * @author Name6
 */

import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsNumber,
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
  @IsNumber()
  readonly width = 100;

  @IsOptional()
  @IsNumber()
  readonly height = 50;
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
