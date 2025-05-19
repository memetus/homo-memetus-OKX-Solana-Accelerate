import { Module } from '@nestjs/common';
import { TokenPoolService } from './token-pool.service';
import { TokenPoolController } from './token-pool.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CoinDataSchema } from 'src/common/schemas/coin-data.schema';
import { TrendTokenSchema } from 'src/common/schemas/trend-token.schema';
import { FundDataSchema } from 'src/common/schemas/fund-data.schema';
import { EmbeddingModule } from 'src/embedding/embedding.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'CoinData', schema: CoinDataSchema },
      { name: 'TrendToken', schema: TrendTokenSchema },
      { name: 'FundData', schema: FundDataSchema },
    ]),
    EmbeddingModule,
  ],
  controllers: [TokenPoolController],
  providers: [TokenPoolService],
})
export class TokenPoolModule {}
