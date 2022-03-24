/**
 * @file Friend model
 * @module modules/friend/model
 * @author Name6
 */

import { IsDefined, IsString, IsArray, IsEmpty } from 'class-validator';
import { prop, modelOptions, plugin } from '@typegoose/typegoose';
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
  @prop({ default: [], type: () => [Message] })
  msgs: Message[];

  @prop({ default: Date.now, immutable: true })
  create_at: Date;

  @prop({ default: Date.now })
  update_at: Date;
}

class Message {
  @IsDefined()
  @IsEmpty()
  @IsString()
  messageType: MsgType;

  @IsDefined()
  @IsEmpty()
  @IsString()
  content: string;

  time: number;
}

export const FriendMessageProvider = getProviderByTypegooseClass(FriendMessage);
