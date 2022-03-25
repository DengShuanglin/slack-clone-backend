/**
 * @file User controller
 * @module modules/user/controller
 * @author Name6
 */

import { Request } from 'express';
import type { RequestUser } from '@/interfaces/req-user.interface';

import { HttpProcessor } from '@/common/decorators/http.decorator';
import { Body, Controller, Get, Put, Query, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserInfoPayload } from './user.model';
import { JwtAuthGuard } from '@/common/guards/auth.guard';
import { Authorize } from '@/common/decorators/authorize.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('getInfo')
  @HttpProcessor.handle({ message: 'Get user info' })
  async get(@Req() req: Request) {
    const { email, id } = req.user as RequestUser;
    const user = await this.userService.findOne({ email });
    const friends = await this.userService.find(user.friends);
    return {
      user_id: id,
      nickname: user.nickname || 'user' + id,
      avatar: user.avatar,
      channels: user.channels,
      friends: friends,
    };
  }

  @Get('avatars')
  @HttpProcessor.handle({ message: 'Get avatars' })
  avatars() {
    return [
      'https://my-picture-bed-1304169582.cos.ap-nanjing.myqcloud.com/picture/avatar(1).png',
      'https://my-picture-bed-1304169582.cos.ap-nanjing.myqcloud.com/picture/avatar(2).png',
      'https://my-picture-bed-1304169582.cos.ap-nanjing.myqcloud.com/picture/avatar(3).png',
      'https://my-picture-bed-1304169582.cos.ap-nanjing.myqcloud.com/picture/avatar(4).png',
      'https://my-picture-bed-1304169582.cos.ap-nanjing.myqcloud.com/picture/avatar(5).png',
      'https://my-picture-bed-1304169582.cos.ap-nanjing.myqcloud.com/picture/avatar(6).png',
      'https://my-picture-bed-1304169582.cos.ap-nanjing.myqcloud.com/picture/avatar(7).png',
      'https://my-picture-bed-1304169582.cos.ap-nanjing.myqcloud.com/picture/avatar(8).png',
      'https://my-picture-bed-1304169582.cos.ap-nanjing.myqcloud.com/picture/avatar(9).png',
      'https://my-picture-bed-1304169582.cos.ap-nanjing.myqcloud.com/picture/avatar(10).png',
    ];
  }

  @Put('update')
  @HttpProcessor.handle({ message: 'Update personal info' })
  update(@Body() body: UserInfoPayload, @Req() req: Request) {
    const { id } = req.user as RequestUser;
    this.userService.updateOne(id, body);
    return true;
  }

  @Get('search')
  @Authorize()
  @HttpProcessor.handle({ message: 'Get users' })
  getUsers(@Query() { email }: { email: string }) {
    return this.userService.fuzzySearch(email);
  }
}
