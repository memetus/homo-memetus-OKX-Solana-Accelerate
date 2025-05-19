import { Module } from '@nestjs/common';
import { KeywordService } from './keyword.service';
import { KeywordController } from './keyword.controller';
import { KolPoolSchema } from 'src/common/schemas/kol-pool.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { KeywordSchema } from 'src/common/schemas/keyword.schema';
import { TrendTokenSchema } from 'src/common/schemas/trend-token.schema';
import { EmbeddingModule } from 'src/embedding/embedding.module';
import { CoinPriceSchema } from 'src/common/schemas/coin-price.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'KolPool', schema: KolPoolSchema },
      { name: 'Keyword', schema: KeywordSchema },
      { name: 'TrendToken', schema: TrendTokenSchema },
      { name: 'CoinPrice', schema: CoinPriceSchema },
    ]),
    EmbeddingModule,
  ],
  controllers: [KeywordController],
  providers: [KeywordService],
})
export class KeywordModule {}
