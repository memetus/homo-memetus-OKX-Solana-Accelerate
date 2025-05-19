import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CoinPriceSchema } from 'src/common/schemas/coin-price.schema';
import { FundDataSchema } from 'src/common/schemas/fund-data.schema';
import { TradingResultSchema } from 'src/common/schemas/trading-result.schema';
import { TrendTokenSchema } from 'src/common/schemas/trend-token.schema';
import { KeywordSchema } from 'src/common/schemas/keyword.schema';
import { KolPoolSchema } from 'src/common/schemas/kol-pool.schema';
import { KeywordAgent } from './agents/keyword.agent';
import { TradingAgent } from './agents/trading.agent';
import { CoinMetaAgent } from './agents/coin-meta.agent';
import { PortfolioAgent } from './agents/portfolio.agent';
import { SymbolAgent } from './agents/symbol.agent';
import { ScraperService } from './services/scraper.service';
import { MarketAgent } from './agents/market.agent';
import { KolAgent } from './agents/kol.agent';
import { TrendAgent } from './agents/trend.agent';
import { KolPoolAgent } from './agents/kol-pool.agent';
import { SupervisorAgent } from './agents/supervisor.agent';
import { DecisionMakerAgent } from './agents/decision-maker.agent';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'FundData', schema: FundDataSchema },
      { name: 'TradingResult', schema: TradingResultSchema },
      { name: 'CoinPrice', schema: CoinPriceSchema },
      { name: 'TrendToken', schema: TrendTokenSchema },
      { name: 'Keyword', schema: KeywordSchema },
      { name: 'KolPool', schema: KolPoolSchema },
    ]),
  ],
  controllers: [AgentController],
  providers: [
    AgentService,
    KeywordAgent,
    TradingAgent,
    CoinMetaAgent,
    PortfolioAgent,
    SymbolAgent,
    ScraperService,
    MarketAgent,
    KolAgent,
    TrendAgent,
    KolPoolAgent,
    SupervisorAgent,
    DecisionMakerAgent,
  ],
  exports: [
    AgentService,
    KolAgent,
    KolPoolAgent,
    TrendAgent,
    SymbolAgent,
    CoinMetaAgent,
    MarketAgent,
    TradingAgent,
    PortfolioAgent,
    SupervisorAgent,
  ],
})
export class AgentModule {}
