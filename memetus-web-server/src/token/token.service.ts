import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CoinData } from 'src/common/schemas/coin-data.schema';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel('CoinData') private coinDataModel: Model<CoinData>,
  ) {}

  async getTokenMetadata(tokenAddress: string) {
    const tokenInfo = await this.coinDataModel.findOne(
      { address: tokenAddress },
      { embedding: 0 },
    );

    return tokenInfo;
  }
}
