import { InjectModel } from '@/common/transformers/model.transformer';
import { MongooseModel } from '@/interfaces/mongoose.interface';
import { Injectable } from '@nestjs/common';
import { User, UserInfoPayload } from './user.model';

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private readonly userModel: MongooseModel<User>) {}

  async isExist(email: string) {
    const user = await this.userModel.findOne({ email }).exec();
    if (user) return true;
    return false;
  }

  async createOne(user) {
    await this.userModel.create(user);
  }

  async findOne(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) throw 'The user is not exist';
    return user;
  }

  async find(ids: number[]) {
    const users = await this.userModel.find({ id: { $in: ids } }).exec();
    return users.map((item) => ({
      id: item.id as number,
      nickname: item.nickname || 'uesr' + item.id,
      avatar: item.avatar,
    }));
  }

  updateOne(info: UserInfoPayload) {
    const { nickname, avatar } = info;
    const query = {};
    if (nickname) query['nickname'] = nickname;
    if (avatar) query['avatar'] = avatar;
    this.userModel.updateOne(query).exec();
  }
}
