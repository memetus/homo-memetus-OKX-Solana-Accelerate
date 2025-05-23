import { Body, Controller, Get, Post, Query, Param } from '@nestjs/common';
import { SendaiService } from './service/sendai.service';
import { CreateSwapDto, ParseSignatureDto } from './dto/req.dto';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RealTradingService } from './real-trading.service';

@ApiTags('Real Trading')
@Controller('real-trading')
export class RealTradingController {
  constructor(
    private readonly realTradingService: RealTradingService,
    private readonly sendaiService: SendaiService,
  ) {}

  @Get('balance')
  async getBalance() {
    return this.sendaiService.getBalance();
  }

  // @Post('trade')
  // async trade(@Body() createSwapDto: CreateSwapDto) {
  //   return this.sendaiService.executeSwap(createSwapDto);
  // }

  @Get('signature')
  @ApiQuery({ name: 'signature', required: true })
  async parseTransaction(@Query() query: ParseSignatureDto) {
    return this.sendaiService.parseTransaction(query.signature);
  }

  @Get('holdings/:address')
  @ApiParam({
    name: 'address',
    required: true,
    description: 'account address',
  })
  async getContractAssets(@Param('address') address: string) {
    return this.sendaiService.getContractAssets(address);
  }

  @Get('fund-real-trading')
  async fundRealTrading() {
    return this.realTradingService.fundRealTrading();
  }

  // @Post('execute-swap')
  // async executeSwap(@Body() createSwapDto: CreateSwapDto) {
  //   return this.sendaiService.executeSwap(createSwapDto);
  // }

  @Get('tokens')
  async getTokens() {
    return this.sendaiService.getTokens();
  }

  @Post('quote')
  async getQuote(@Body() createSwapDto: CreateSwapDto) {
    return this.sendaiService.getQuote(createSwapDto);
  }

  @Post('trade')
  async trade(@Body() createSwapDto: CreateSwapDto) {
    return this.sendaiService.executeSwap(createSwapDto);
  }
}
