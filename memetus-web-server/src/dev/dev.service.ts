import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Strategy } from 'src/common/schemas/strategies.schema';
import { Users } from 'src/common/schemas/users.schema';

@Injectable()
export class DevService {
  constructor(
    @InjectModel('Users')
    private usersModel: Model<Users>,
    @InjectModel('Strategy')
    private strategyModel: Model<Strategy>,
  ) {}

  async deleteUser(userId: string) {
    const userInfo = await this.usersModel.findByIdAndDelete(userId);

    return userInfo;
  }

  async deleteStrategy(strategyId: string) {
    const strategyInfo = await this.strategyModel.findByIdAndDelete(strategyId);

    return strategyInfo;
  }
}
