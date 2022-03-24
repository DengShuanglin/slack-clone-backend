/**
 * @file Chat model
 * @module modules/chat/model
 * @author Name6
 */

import { MsgType } from '../friend/friend.model';

export interface UserMap {
  user_id: string;
  friend_id: string;
}

// 好友消息
export interface FriendMessageDto {
  user_id: string;
  friend_id: string;
  content: string;
  width?: number;
  height?: number;
  messageType: MsgType;
  time: number;
}
