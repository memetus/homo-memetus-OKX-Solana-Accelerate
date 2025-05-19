import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { PriceService } from './price.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('price')
@Controller('price')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get('codex-test')
  getMarketDataByCodex() {
    return this.priceService.getMarketDataByCodex();
  }

  @Get('run-cron')
  async runCronJob() {
    console.log('🔄 [MANUAL] Manually triggering cron job');
    await this.priceService.handleCronPriceDataEmbedding();
    return {
      success: true,
      message: 'cron job completed',
    };
  }

  @Get('total-realized-profit/:fundId')
  getTotalRealizedProfit(@Param('fundId') fundId: string) {
    return this.priceService.getTotalRealizedProfit(fundId);
  }

  @Get('realized-profit/:fundId')
  getRealizedProfitByFundId(@Param('fundId') fundId: string) {
    return this.priceService.getRealizedProfitByFundId(fundId);
  }

  @Post('rebuild-portfolio')
  async rebuildPortfolio(@Body() data: { fundId: string }) {
    try {
      await this.priceService.rebuildPortfolioFromTradingHistory(data.fundId);
      return {
        success: true,
        message: '포트폴리오가 성공적으로 재구성되었습니다.',
      };
    } catch (error) {
      throw new BadRequestException(
        '포트폴리오 재구성 중 오류가 발생했습니다: ' + error.message,
      );
    }
  }

  @Post('analyze-token')
  async analyzeToken(@Body() data: { fundId: string; tokenSymbol: string }) {
    try {
      const result = await this.priceService.analyzeTokenTrades(
        data.fundId,
        data.tokenSymbol,
      );
      return result;
    } catch (error) {
      throw new BadRequestException(
        '토큰 분석 중 오류가 발생했습니다: ' + error.message,
      );
    }
  }
}
