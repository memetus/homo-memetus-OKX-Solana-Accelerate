import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/req.dto';
import { Users } from 'src/common/schemas/users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('Users')
    private usersModel: Model<Users>,
    private jwtService: JwtService,
  ) {}

  async create(data: CreateUserDto) {
    const { wallet, timezone } = data;

    const userInfo = await this.usersModel.findOneAndUpdate(
      { wallet },
      { timezone },
      { new: true },
    );

    if (userInfo) {
      const accessToken = this.generateAccessToken(userInfo._id.toString());

      return {
        userId: userInfo._id.toString(),
        accessToken,
        createdAt: userInfo.createdAt,
      };
    }

    const newUser = {
      wallet,
      timezone,
    };

    const newUserInfo = await this.usersModel.create(newUser);

    return {
      userId: newUserInfo._id.toString(),
      accessToken: this.generateAccessToken(newUserInfo._id.toString()),
      createdAt: newUserInfo.createdAt,
    };
  }

  findOne(userId: string) {
    const userInfo = this.usersModel.findById(userId);

    if (!userInfo) {
      throw new BadRequestException('User not found');
    }

    return userInfo;
  }

  private generateAccessToken(userId: string) {
    const payload = { sub: userId, tokenType: 'access' };
    return this.jwtService.sign(payload, { expiresIn: '30d' });
  }
}
