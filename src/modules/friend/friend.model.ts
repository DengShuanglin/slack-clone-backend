/**
 * @file Friend model
 * @module modules/friend/model
 * @author Name6
 */

import { IsDefined, IsString, IsArray, IsEmpty, IsNotEmpty } from 'class-validator';
import { prop, modelOptions, plugin, Severity } from '@typegoose/typegoose';
import { getProviderByTypegooseClass } from '@/common/transformers/model.transformer';
import { AutoIncrementID } from '@typegoose/auto-increment';
import { generalAutoIncrementIDConfig } from '@/constants/increment.constant';

export enum MsgType {
  text,
  img,
  voice,
}

@plugin(AutoIncrementID, generalAutoIncrementIDConfig)
@modelOptions({
  schemaOptions: {
    versionKey: false,
    timestamps: {
      createdAt: 'create_at',
      updatedAt: 'update_at',
    },
  },
  options: { allowMixed: Severity.ALLOW },
})
export class FriendMessage {
  @prop({ unique: true, get: (val: number) => '' + val })
  id: number;

  @IsDefined()
  @IsEmpty()
  @IsString()
  @prop({ required: true })
  user_id: string;

  @IsDefined()
  @IsEmpty()
  @IsString()
  @prop({ required: true })
  friend_id: string;

  @IsArray()
  @prop({ default: [] })
  msgs: Message[];

  @prop({ default: Date.now, immutable: true })
  create_at: Date;

  @prop({ default: Date.now })
  update_at: Date;
}

interface Message {
  user_id: string;

  messageType: MsgType;

  content: string;

  time: number;
}

export class UserAndFriendId {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  friend_id: string;
}

export const FriendMessageProvider = getProviderByTypegooseClass(FriendMessage);
