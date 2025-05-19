import { KolPoolSchema } from './../common/schemas/kol-pool.schema';
import { Module } from '@nestjs/common';
import { CoinDataSchema } from 'src/common/schemas/coin-data.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CoinPriceSchema } from 'src/common/schemas/coin-price.schema';
import { EmbeddingController } from './embedding.controller';
import { EmbeddingService } from './embedding.service';
import { TrendTokenSchema } from 'src/common/schemas/trend-token.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'CoinData', schema: CoinDataSchema },
      { name: 'CoinPrice', schema: CoinPriceSchema },
      { name: 'TrendToken', schema: TrendTokenSchema },
      { name: 'KolPool', schema: KolPoolSchema },
    ]),
  ],
  controllers: [EmbeddingController],
  providers: [EmbeddingService],
  exports: [EmbeddingService],
})
export class EmbeddingModule {}
