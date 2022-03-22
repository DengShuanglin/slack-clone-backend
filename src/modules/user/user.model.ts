/**
 * @file User model
 * @module modules/user/model
 * @author Name6
 */

import {
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ArrayUnique,
} from 'class-validator';
import { prop, modelOptions, plugin } from '@typegoose/typegoose';
import { getProviderByTypegooseClass } from '@/common/transformers/model.transformer';
import { AutoIncrementID } from '@typegoose/auto-increment';
import { generalAutoIncrementIDConfig } from '@/constants/increment.constant';

@plugin(AutoIncrementID, generalAutoIncrementIDConfig)
@modelOptions({
  schemaOptions: {
    versionKey: false,
    timestamps: {
      createdAt: 'create_at',
      updatedAt: 'update_at',
    },
  },
})
export class User {
  @prop({ unique: true })
  id: number;

  @IsDefined()
  @IsString()
  @prop({ required: true })
  password: string;

  @IsDefined()
  @IsString({ message: `what's your email?` })
  @prop({ required: true, unique: true })
  email: string;

  nickname?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @prop({ type: () => [Number] })
  roles?: number[];

  @IsOptional()
  @IsString()
  @prop({
    default:
      'https://my-picture-bed-1304169582.cos.ap-nanjing.myqcloud.com/picture/user.jpg',
  })
  avatar?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @prop({ type: () => [Number] })
  channels?: number[];

  @prop({ default: Date.now, immutable: true })
  create_at?: Date;

  @prop({ default: Date.now })
  update_at?: Date;

  @IsOptional()
  @IsInt()
  @prop({ default: 1 })
  status?: 1 | 0;
}

export class UserInfo {
  @IsDefined()
  @IsNotEmpty({ message: 'hi' })
  @IsString()
  username: string;

  @IsDefined()
  @IsNotEmpty({ message: 'hello' })
  @IsString()
  password: string;

  avatar?: string;

  desc?: string;
}

export const UserProvider = getProviderByTypegooseClass(User);