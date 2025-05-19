import { Module } from '@nestjs/common';
import { DevService } from './dev.service';
import { DevController } from './dev.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CoinPriceSchema } from 'src/common/schemas/coin-price.schema';
import { FundDataSchema } from 'src/common/schemas/fund-data.schema';
import { TradingResultSchema } from 'src/common/schemas/trading-result.schema';
import { TradingModule } from 'src/trading/trading.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'CoinPrice', schema: CoinPriceSchema },
      { name: 'FundData', schema: FundDataSchema },
      { name: 'TradingResult', schema: TradingResultSchema },
    ]),
    TradingModule,
  ],
  controllers: [DevController],
  providers: [DevService],
})
export class DevModule {}
