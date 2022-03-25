import { InjectModel } from '@/common/transformers/model.transformer';
import { MongooseModel } from '@/interfaces/mongoose.interface';
import { Injectable } from '@nestjs/common';
import { FriendMessage, UserAndFriendId } from './friend.model';

@Injectable()
export class FriendService {
  constructor(
    @InjectModel(FriendMessage)
    private readonly friendMessageModel: MongooseModel<FriendMessage>,
  ) {}

  addImgMessage(url: string, info: UserAndFriendId) {
    this.friendMessageModel
      .updateOne(info, {
        $push: { msgs: { messageType: 1, content: url, time: new Date().valueOf() } },
      })
      .exec();
  }
}
