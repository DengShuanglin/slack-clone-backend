/**
 * @file Chat gateway
 * @module modules/chat/gateway
 * @author Name6
 */

import type { Server, Socket } from 'socket.io';

import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { InjectModel } from '@/common/transformers/model.transformer';
import { MongooseModel } from '@/interfaces/mongoose.interface';
import { User } from '../user/user.model';
import { FriendMessageDto, UserMap } from './chat.model';
import { RCode } from '@/constants/system.constant';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/auth.guard';
import { CacheService } from '@/processors/cache/cache.service';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { FriendMessage, MsgType } from '../friend/friend.model';

@WebSocketGateway({
  // 处理跨域
  cors: {
    origin: '*',
  },
})
@UseGuards(JwtAuthGuard)
export class ChatGateway {
  constructor(
    @InjectModel(User) private readonly userModel: MongooseModel<User>,
    @InjectModel(FriendMessage)
    private readonly friendMessageModel: MongooseModel<FriendMessage>,
    private readonly cacheService: CacheService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket): Promise<string> {
    const userRoom = client.handshake.query.user_id as string;
    // 用户独有消息房间 根据userId
    userRoom && client.join(userRoom);
    const data = await this.cacheService.get(`admin:msg:${userRoom}`);
    data && this.server.to(userRoom).emit('confirmRequest', data);
    return '连接成功';
  }

  @SubscribeMessage('addFriend')
  async addFriend(@ConnectedSocket() client: Socket, @MessageBody() data: UserMap) {
    const { user_id, friend_id } = data;
    console.log(user_id, friend_id);
    const user = await this.userModel.findOne({ id: user_id }).exec();
    const friend = await this.userModel.findOne({ id: friend_id }).exec();
    if (user && friend) {
      if (friend_id === user_id) {
        this.server
          .to(user_id)
          .emit('addFriend', { code: RCode.FAIL, msg: '不能添加自己为好友' });
        return;
      }
      const isRelation1 = user.friends.some((id) => id === friend_id);
      const isRelation2 = friend.friends.some((id) => id === user_id);
      if (isRelation1 || isRelation2) {
        this.server.to(user_id).emit('addFriend', { code: RCode.FAIL, msg: '好友已存在' });
        return;
      }
      this.server
        .to(user_id)
        .emit('addFriend', { code: RCode.OK, msg: '发送添加好友信息成功' });
      const data = {
        friend_id: user_id,
        nickname: user.nickname || 'user' + user_id,
        avatar: user.avatar,
      };

      // 持久化
      await this.cacheService.set(`admin:msg:${friend_id}`, data, {
        ttl: 60 * 60 * 24 * 3,
      });

      this.server.to(friend_id).emit('confirmRequest', {
        code: RCode.OK,
        msg: '添加好友申请',
        data,
      });
    } else {
      this.server.to(user_id).emit('addFriend', { code: RCode.FAIL, msg: '参数错误' });
    }
  }

  @SubscribeMessage('confirmRequest')
  async confirmRequest(@ConnectedSocket() client: Socket, @MessageBody() data: UserMap) {
    const { user_id, friend_id } = data;
    this.userModel.updateOne({ id: user_id }, { $push: { friends: friend_id } }).exec();
    this.userModel.updateOne({ id: friend_id }, { $push: { friends: user_id } }).exec();
    this.cacheService.delete(`admin:msg:${user_id}`);
    this.server
      .to(user_id)
      .emit('confirmRequest', { code: RCode.OK, msg: '添加好友成功' });
    this.server
      .to(friend_id)
      .emit('confirmRequest', { code: RCode.OK, msg: '添加好友成功' });
    return '添加成功';
  }

  // 加入私聊的socket连接
  @SubscribeMessage('joinFriendSocket')
  async joinFriend(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: UserMap,
  ): Promise<any> {
    const { friend_id, user_id } = data;
    if (friend_id && user_id) {
      const roomId = user_id > friend_id ? user_id + friend_id : friend_id + user_id;
      const user = await this.userModel.findOne({ id: user_id }).exec();
      const friend = await this.userModel.findOne({ id: friend_id }).exec();
      if (user && friend) {
        const isRelation1 = user.friends.some((id) => id === friend_id);
        const isRelation2 = friend.friends.some((id) => id === user_id);
        if (isRelation1 && isRelation2) {
          this.friendMessageModel.create({ user_id, friend_id });
          client.join(roomId);
          this.server.to(user_id).emit('joinFriendSocket', {
            code: RCode.OK,
            msg: '进入私聊socket成功',
            data,
          });
        } else {
          this.server.to(user_id).emit('joinFriendSocket', {
            code: RCode.FAIL,
            msg: '不是好友关系',
          });
        }
      }
    }
  }

  // 发送私聊信息
  @SubscribeMessage('friendMessage')
  async friendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: FriendMessageDto,
  ): Promise<any> {
    const { user_id, friend_id, messageType } = data;
    const user = await this.userModel.findOne({ userId: user_id });
    if (user) {
      if (user_id && friend_id) {
        const roomId = user_id > friend_id ? user_id + friend_id : friend_id + user_id;
        if (data.messageType === MsgType.img) {
          const randomName = `${Date.now()}$${roomId}$${data.width}$${data.height}`;
          const stream = createWriteStream(join('public/static', randomName));
          stream.write(data.content);
          data.content = randomName;
        }
        data.time = new Date().valueOf();
        this.friendMessageModel
          .updateOne(
            { user_id, friend_id },
            { $push: { msgs: { messageType, content: data.content, time: data.time } } },
          )
          .exec();
        this.server
          .to(roomId)
          .emit('friendMessage', { code: RCode.OK, msg: '发送成功', data });
      }
    } else {
      this.server
        .to(user_id)
        .emit('friendMessage', { code: RCode.FAIL, msg: '你没资格发消息', data });
    }
  }

  // @SubscribeMessage('chatData')
  // async getChatData(@ConnectedSocket() client: Socket, @MessageBody() body: )
}
