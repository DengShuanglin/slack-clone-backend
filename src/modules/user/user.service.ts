import { InjectModel } from '@/common/transformers/model.transformer';
import { MongooseModel } from '@/interfaces/mongoose.interface';
import { Injectable } from '@nestjs/common';
import { User } from './user.model';

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
}
