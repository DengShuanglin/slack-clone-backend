import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { UserProvider } from '../user/user.model';
import { FriendMessageProvider } from '../friend/friend.model';

@Module({
  providers: [ChatGateway, UserProvider, FriendMessageProvider],
})
export class ChatModule {}
