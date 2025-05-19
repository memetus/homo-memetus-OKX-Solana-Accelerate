import { Module } from '@nestjs/common';
import { AgentDataService } from './agent-data.service';
import { AgentDataController } from './agent-data.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FundDataSchema } from 'src/common/schemas/fund-data.schema';
import { TradingResultSchema } from 'src/common/schemas/trading-result.schema';
import { CoinPriceSchema } from 'src/common/schemas/coin-price.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'FundData', schema: FundDataSchema },
      { name: 'TradingResult', schema: TradingResultSchema },
      { name: 'CoinPrice', schema: CoinPriceSchema },
    ]),
  ],
  controllers: [AgentDataController],
  providers: [AgentDataService],
})
export class AgentDataModule {}
