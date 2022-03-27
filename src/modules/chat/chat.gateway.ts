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
import { addType, User } from '../user/user.model';
import { FriendMessageDto, UserMap } from './chat.model';
import { RCode } from '@/constants/system.constant';
import { CacheService } from '@/processors/cache/cache.service';
import { FriendMessage } from '../friend/friend.model';

@WebSocketGateway({
  // 处理跨域
  cors: {
    origin: '*',
  },
})
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
    // data && this.server.to(userRoom).emit('confirmRequest', data.friendMsgs);
    return '连接成功';
  }

  @SubscribeMessage('getFriendRequest')
  async getFriendRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() { user_id }: { user_id: string },
  ) {
    const data = await this.userModel.findOne({ id: user_id });
    this.server.to(user_id).emit('getFriendRequest', data?.friendMsgs);
  }

  @SubscribeMessage('addFriend')
  async addFriend(@ConnectedSocket() client: Socket, @MessageBody() data: UserMap) {
    const { user_id, friend_id } = data;

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

      this.server.to(friend_id).emit('confirmRequest', {
        code: RCode.OK,
        msg: '添加好友申请',
        data,
      });

      // 持久化
      await this.userModel
        .updateOne(
          { id: user_id },
          {
            $push: {
              friendMsgs: {
                user_id: friend_id,
                avatar: friend.avatar,
                nickname: friend.nickname || 'user' + friend_id,
                type: addType.Pending,
              },
            },
          },
        )
        .exec();
      await this.userModel
        .updateOne(
          { id: friend_id },
          {
            $push: {
              friendMsgs: {
                user_id,
                avatar: user.avatar,
                nickname: user.nickname || 'user' + user_id,
                type: addType.Pending,
              },
            },
          },
        )
        .exec();
    } else {
      this.server.to(user_id).emit('addFriend', { code: RCode.FAIL, msg: '参数错误' });
    }
  }

  @SubscribeMessage('confirmRequest')
  confirmRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: UserMap & { type: addType },
  ) {
    const { user_id, friend_id, type } = data;
    if (type === addType.agree) {
      this.userModel
        .updateOne(
          { id: friend_id, friendMsgs: { $elemMatch: { user_id } } },
          { $push: { friends: user_id }, $set: { 'friendMsgs.$.type': addType.agree } },
        )
        .exec();
      this.userModel
        .updateOne(
          { id: user_id, friendMsgs: { $elemMatch: { user_id: friend_id } } },
          { $push: { friends: friend_id }, $set: { 'friendMsgs.$.type': addType.agree } },
        )
        .exec();
    } else if (type === addType.reject) {
      this.userModel
        .updateOne(
          { id: friend_id, friendMsgs: { $elemMatch: { user_id } } },
          { $push: { friends: user_id }, $set: { 'friendMsgs.$.type': addType.reject } },
        )
        .exec();
      this.userModel
        .updateOne(
          { id: user_id, friendMsgs: { $elemMatch: { user_id: friend_id } } },
          { $push: { friends: friend_id }, $set: { 'friendMsgs.$.type': addType.reject } },
        )
        .exec();
    }
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
          const friendMessage = await this.friendMessageModel
            .findOne({ user_id, friend_id })
            .exec();
          !friendMessage && (await this.friendMessageModel.create({ user_id, friend_id }));
          if (friendMessage?.msgs.length) data['msgs'] = friendMessage?.msgs;
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
        data.time = new Date().valueOf();
        await this.friendMessageModel
          .updateOne(
            { user_id, friend_id },
            {
              $push: {
                msgs: { user_id, messageType, content: data.content, time: data.time },
              },
            },
          )
          .exec();
        await this.friendMessageModel
          .updateOne(
            {
              user_id: friend_id,
              friend_id: user_id,
            },
            {
              $push: {
                msgs: { user_id, messageType, content: data.content, time: data.time },
              },
            },
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
}
