import { FundDataSchema } from './../common/schemas/fund-data.schema';
import { Module } from '@nestjs/common';
import { PromptGptService } from './prompt-gpt.service';
import { PromptGptController } from './prompt-gpt.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CoinPriceSchema } from 'src/common/schemas/coin-price.schema';
import { CoinDataSchema } from 'src/common/schemas/coin-data.schema';
import { GptStrategySchema } from 'src/common/schemas/gpt-strategies.schema';
import { UsersSchema } from 'src/common/schemas/users.schema';
import { TradingResultSchema } from 'src/common/schemas/trading-result.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Users', schema: UsersSchema },
      { name: 'GptStrategy', schema: GptStrategySchema },
      { name: 'CoinData', schema: CoinDataSchema },
      { name: 'CoinPrice', schema: CoinPriceSchema },
      { name: 'FundData', schema: FundDataSchema },
      { name: 'TradingResult', schema: TradingResultSchema },
    ]),
  ],
  controllers: [PromptGptController],
  providers: [PromptGptService],
})
export class PromptGptModule {}
