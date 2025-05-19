import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AnalysisService } from './analysis.service';
import { FundIdReqDto, VectorSearchDto } from 'src/common/dto/req.dto';

@ApiTags('analysis')
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('trading-strategy/:fundId')
  getCoinTradingStrategy(@Param() { fundId }: FundIdReqDto) {
    console.log(fundId);
    return this.analysisService.getCoinTradingStrategy(fundId);
  }

  @Post('langchain-vector-search')
  langChainVectorSearch(@Body() { query }: VectorSearchDto) {
    return this.analysisService.langChainVectorSearch(query);
  }

  @Get('portfolio/:fundId')
  getPortfolio(@Param() { fundId }: FundIdReqDto) {
    return this.analysisService.getPortfolio(fundId);
  }
}
