import { Module } from '@nestjs/common';
import { RealTradingController } from './real-trading.controller';
import { RealTradingService } from './real-trading.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TradingResultSchema } from 'src/common/schemas/trading-result.schema';
import { FundDataSchema } from 'src/common/schemas/fund-data.schema';
import { SendaiService } from './service/sendai.service';
import { AgentModule } from 'src/agent/agent.module';
import { CoinPriceSchema } from 'src/common/schemas/coin-price.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'TradingResult', schema: TradingResultSchema },
      { name: 'FundData', schema: FundDataSchema },
      { name: 'CoinPrice', schema: CoinPriceSchema },
    ]),
    AgentModule,
  ],
  controllers: [RealTradingController],
  providers: [RealTradingService, SendaiService],
})
export class RealTradingModule {}
