import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { TradingService } from './trading.service';
import { ApiTags } from '@nestjs/swagger';
import { TradingAnalysisReqDto } from './dto/req.dto';
import { FundIdReqDto } from 'src/common/dto/req.dto';

@ApiTags('trading')
@Controller('trading')
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  @Get('ai-agent-trading/:fundId')
  getAgentTrading(@Param() { fundId }: FundIdReqDto) {
    return this.tradingService.getAgentTrading(fundId);
  }

  @Post('test-agent-trading/:fundId')
  setAgentTrading(
    @Param() { fundId }: FundIdReqDto,
    @Body() data: TradingAnalysisReqDto,
  ) {
    return this.tradingService.setAgentTrading(fundId, data);
  }
}
