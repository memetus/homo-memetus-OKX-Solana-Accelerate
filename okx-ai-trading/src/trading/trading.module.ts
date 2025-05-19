import { Module } from '@nestjs/common';
import { TradingService } from './trading.service';
import { TradingController } from './trading.controller';
import { FundDataSchema } from 'src/common/schemas/fund-data.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { TradingResultSchema } from 'src/common/schemas/trading-result.schema';
import { CoinPriceSchema } from 'src/common/schemas/coin-price.schema';
import { AgentModule } from 'src/agent/agent.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'TradingResult', schema: TradingResultSchema },
      { name: 'FundData', schema: FundDataSchema },
      { name: 'CoinPrice', schema: CoinPriceSchema },
    ]),
    AgentModule,
  ],
  controllers: [TradingController],
  providers: [TradingService],
  exports: [TradingService],
})
export class TradingModule {}
