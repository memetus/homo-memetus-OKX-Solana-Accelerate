import { Module } from '@nestjs/common';
import { PriceService } from './price.service';
import { PriceController } from './price.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CoinDataSchema } from 'src/common/schemas/coin-data.schema';
import { CoinPriceSchema } from 'src/common/schemas/coin-price.schema';
import { EmbeddingModule } from 'src/embedding/embedding.module';
import { TrendTokenSchema } from 'src/common/schemas/trend-token.schema';
import { FundDataSchema } from 'src/common/schemas/fund-data.schema';
import { TradingResultSchema } from 'src/common/schemas/trading-result.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'CoinData', schema: CoinDataSchema },
      { name: 'CoinPrice', schema: CoinPriceSchema },
      { name: 'TrendToken', schema: TrendTokenSchema },
      { name: 'FundData', schema: FundDataSchema },
      { name: 'TradingResult', schema: TradingResultSchema },
    ]),
    EmbeddingModule,
  ],
  controllers: [PriceController],
  providers: [PriceService],
})
export class PriceModule {}
