import { FundIdReqDto } from 'src/common/dto/req.dto';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AgentService } from './agent.service';
import { ApiTags } from '@nestjs/swagger';
import { KeywordAgent } from './agents/keyword.agent';
import { QueryReqDto } from './dto/req.dto';
import { TradingAgent } from './agents/trading.agent';
import { SymbolAgent } from './agents/symbol.agent';
import { MarketAgent } from './agents/market.agent';
import { KolAgent } from './agents/kol.agent';
import { TrendAgent } from './agents/trend.agent';
import { KolPoolAgent } from './agents/kol-pool.agent';

@ApiTags('agent')
@Controller('agent')
export class AgentController {
  constructor(
    private readonly agentService: AgentService,
    private readonly keywordAgent: KeywordAgent,
    private readonly tradingAgent: TradingAgent,
    private readonly symbolAgent: SymbolAgent,
    private readonly marketAgent: MarketAgent,
    private readonly kolAgent: KolAgent,
    private readonly kolPoolAgent: KolPoolAgent,
    private readonly trendAgent: TrendAgent,
  ) {}

  @Get('recommendation/:fundId')
  getRecommend(@Param() { fundId }: FundIdReqDto) {
    return this.agentService.getRecommendation(fundId);
  }

  @Get('twitter-timeline')
  getTweets(@Query() { query }: QueryReqDto) {
    return this.keywordAgent.getTweets(query);
  }

  @Get('twitter-keyword')
  getTweetsByKeyword(@Query() { query }: QueryReqDto) {
    return this.keywordAgent.searchTweets(query);
  }

  @Get('twitter-profile')
  getUserProfile(@Query() { query }: QueryReqDto) {
    return this.keywordAgent.getUserProfile(query);
  }

  @Get('trading-agent')
  getTradeAgent(@Query() { query }: QueryReqDto) {
    return this.tradingAgent.getTradeAgent(query);
  }

  @Get('symbol-agent')
  getSymbolAgent(@Query() { query }: QueryReqDto) {
    return this.symbolAgent.getSymbolAgent(query);
  }

  @Get('market-agent')
  getMarketAgent(@Query() { query }: QueryReqDto) {
    return this.marketAgent.getMarketAgent(query);
  }

  @Get('kol-agent')
  getKolAgent(@Query() { query }: QueryReqDto) {
    return this.kolAgent.getKolAgent(query);
  }

  @Get('trend-agent')
  getTrendAgent() {
    return this.trendAgent.getTrendAgent();
  }

  @Get('kol-pool-agent')
  getKolPoolAgent(@Query() { query }: QueryReqDto) {
    return this.kolPoolAgent.getKolPoolAgent(query);
  }
}
