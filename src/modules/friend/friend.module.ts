import { Module } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';
import { FriendMessageProvider } from './friend.model';

@Module({
  controllers: [FriendController],
  providers: [FriendService, FriendMessageProvider],
})
export class FriendModule {}
