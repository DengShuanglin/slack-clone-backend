import { InjectModel } from '@/common/transformers/model.transformer';
import { MongooseModel } from '@/interfaces/mongoose.interface';
import { Injectable } from '@nestjs/common';
import { FriendMessage } from './friend.model';

@Injectable()
export class FriendService {
  constructor(
    @InjectModel(FriendMessage)
    private readonly friendMessageModel: MongooseModel<FriendMessage>,
  ) {}

  async getAllHistory(info) {
    const data = await this.friendMessageModel.findOne(info).exec();
    if (data) return data.msgs as any;
  }
}
