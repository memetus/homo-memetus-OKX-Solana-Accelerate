import { Body, Controller, Get, Post } from '@nestjs/common';
import { DevService } from './dev.service';
import { ApiTags } from '@nestjs/swagger';
import { QueryReqDto } from './dto/req.dto';
import { TradingService } from 'src/trading/trading.service';

@ApiTags('dev')
@Controller('dev')
export class DevController {
  constructor(
    private readonly devService: DevService,
    private readonly tradingService: TradingService,
  ) {}

  @Get('create-coin-price-embedding')
  createCoinPriceEmbeddings() {
    return this.devService.createCoinPriceEmbeddings();
  }

  @Post('vector-search')
  vectorSearchQuery(@Body() { query }: QueryReqDto) {
    return this.devService.vectorSearchQuery(query);
  }

  @Post('langchain-vector-search')
  langChainVectorSearch(@Body() { query }: QueryReqDto) {
    return this.devService.langChainVectorSearch(query);
  }

  @Get('handle-trading')
  handleTrading() {
    return this.tradingService.handleTrading();
  }
}
