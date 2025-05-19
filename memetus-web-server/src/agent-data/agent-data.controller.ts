import { Controller, Get, Param, Query } from '@nestjs/common';
import { AgentDataService } from './agent-data.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorator/public.decorator';
import { FundIdReqDto, PageReqDto } from 'src/common/dto/req.dto';
import { SearchReqDto, SortOrderReqDto, SortQueryReqDto } from './dto/req.dto';

@ApiTags('AgentData')
@Controller('agent-data')
export class AgentDataController {
  constructor(private readonly agentDataService: AgentDataService) {}

  @Public()
  @Get('agent-dashboard')
  getAiDashboard(
    @Query() { sort }: SortQueryReqDto,
    @Query() { sortOrder }: SortOrderReqDto,
    @Query() { page }: PageReqDto,
    @Query() { pageSize }: PageReqDto,
  ) {
    return this.agentDataService.getAiDashboard(
      page,
      pageSize,
      sort,
      sortOrder,
    );
  }

  @Public()
  @Get('agent-dashboard/bubble-chart')
  getBubbleChart() {
    return this.agentDataService.getBubbleChart();
  }

  @Public()
  @Get('agent-dashboard/top-pics')
  getTopPics(@Query() { page }: PageReqDto, @Query() { pageSize }: PageReqDto) {
    return this.agentDataService.getTopPics(page, pageSize);
  }

  @Public()
  @Get('agent-dashboard/search')
  getSearchTopPics(@Query() { search }: SearchReqDto) {
    return this.agentDataService.getSearchTopPics(search);
  }

  @Public()
  @Get('agent-dashboard/:fundId')
  getAiDashboardByFundId(@Param() { fundId }: FundIdReqDto) {
    return this.agentDataService.getAiDashboardByFundId(fundId);
  }

  @Public()
  @Get('agent-metadata/:fundId')
  getAiMetaData(@Param() { fundId }: FundIdReqDto) {
    return this.agentDataService.getAiMetaData(fundId);
  }

  @Public()
  @Get('agent-stat/:fundId')
  getAgentStatByFundId(@Param() { fundId }: FundIdReqDto) {
    return this.agentDataService.getAgentStatByFundId(fundId);
  }

  @Public()
  @Get('portfolio/activity/:fundId')
  getActivityByFundId(
    @Param() { fundId }: FundIdReqDto,
    @Query() { page }: PageReqDto,
    @Query() { pageSize }: PageReqDto,
  ) {
    return this.agentDataService.getActivityByFundId(fundId, page, pageSize);
  }

  @Public()
  @Get('portfolio/holdings/:fundId')
  getHoldingsByFundId(
    @Param() { fundId }: FundIdReqDto,
    @Query() { sort }: SortQueryReqDto,
    @Query() { sortOrder }: SortOrderReqDto,
    @Query() { page }: PageReqDto,
    @Query() { pageSize }: PageReqDto,
  ) {
    return this.agentDataService.getHoldingsByFundId(
      fundId,
      page,
      pageSize,
      sort,
      sortOrder,
    );
  }

  @Public()
  @Get('agent-dashboard/real-trading/top-pics')
  getRealTradingTopPics(
    @Query() { page }: PageReqDto,
    @Query() { pageSize }: PageReqDto,
  ) {
    return this.agentDataService.getRealTradingTopPics(page, pageSize);
  }

  @Public()
  @Get('agent-dashboard/real-trading/graph/:fundId')
  getRealTradingGraph(@Param() { fundId }: FundIdReqDto) {
    return this.agentDataService.getRealTradingGraph(fundId);
  }
}
