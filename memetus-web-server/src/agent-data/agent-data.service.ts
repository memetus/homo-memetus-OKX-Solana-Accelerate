import { TradingResult } from './../common/schemas/trading-result.schema';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CoinPrice } from 'src/common/schemas/coin-price.schema';
import { FundData } from 'src/common/schemas/fund-data.schema';

@Injectable()
export class AgentDataService {
  constructor(
    @InjectModel('FundData')
    private fundDataModel: Model<FundData>,
    @InjectModel('TradingResult')
    private tradingResultModel: Model<TradingResult>,
    @InjectModel('CoinPrice')
    private coinPriceModel: Model<CoinPrice>,
  ) {}

  async getAiDashboard(
    page: number,
    pageSize: number,
    sort?: string,
    sortOrder?: string,
  ) {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const fundDataInfo = await this.fundDataModel.find();

    const results = fundDataInfo.map((fund) => ({
      fundId: fund._id.toString(),
      name: fund.name,
      imageUrl: fund.imageUrl,
      generation: fund.generation,
      strategyPrompt: fund.strategyPrompt,
      nav: fund.nav,
      realizedProfit: fund.realizedProfit,
      unrealizedProfit: fund.unrealizedProfit,
      totalPnL: fund.totalPnL,
      survived: fund.survived,
      realTrading: fund.realTrading,
      createdAt: fund.createdAt,
    }));

    // 정렬 조건이 있는 경우 적용
    if (sort && sortOrder) {
      results.sort((a, b) => {
        // realTrading이 다른 경우, realTrading이 true인 것이 항상 앞으로
        if (a.realTrading !== b.realTrading) {
          return a.realTrading ? -1 : 1;
        }

        // realTrading이 같은 경우에만 요청된 정렬 조건 적용
        const direction = sortOrder === 'asc' ? 1 : -1;
        if (sort === 'realized') {
          return (a.realizedProfit - b.realizedProfit) * direction;
        } else if (sort === 'unrealized') {
          return (a.unrealizedProfit - b.unrealizedProfit) * direction;
        } else if (sort === 'totalPnL') {
          return (a.totalPnL - b.totalPnL) * direction;
        } else if (sort === 'nav') {
          return (a.nav - b.nav) * direction;
        } else if (sort === 'age') {
          return (a.createdAt.getTime() - b.createdAt.getTime()) * direction;
        }
        return 0;
      });
    } else {
      // 정렬 조건이 없는 경우 realTrading 기준으로만 정렬
      results.sort((a, b) => {
        if (a.realTrading && !b.realTrading) return -1;
        if (!a.realTrading && b.realTrading) return 1;
        return 0;
      });
    }

    const paginatedResults = results.slice(skip, skip + limit);

    return {
      totalCount: results.length,
      results: paginatedResults,
    };
  }

  async getAiDashboardByFundId(fundId: string) {
    const fundDataInfo = await this.fundDataModel.findById(fundId);
    if (!fundDataInfo) {
      throw new BadRequestException('fund not found');
    }

    const topPics = fundDataInfo.portfolio
      .filter(
        (item) =>
          item.totalPnL !== null &&
          item.totalPnL !== undefined &&
          !isNaN(Number(item.totalPnL)) &&
          isFinite(Number(item.totalPnL)),
      )
      .sort((a, b) => b.totalPnL - a.totalPnL)
      .slice(0, 2)
      .map((item) => ({
        token: item.symbol,
        totalPnL: item.totalPnL,
      }));

    return {
      fundId: fundDataInfo._id,
      name: fundDataInfo.name,
      imageUrl: fundDataInfo.imageUrl,
      generation: fundDataInfo.generation,
      strategyPrompt: fundDataInfo.strategyPrompt,
      nav: fundDataInfo.nav,
      realizedProfit: fundDataInfo.realizedProfit,
      unrealizedProfit: fundDataInfo.unrealizedProfit,
      totalPnL: fundDataInfo.totalPnL,
      topPics,
      survived: fundDataInfo.survived,
      realTrading: fundDataInfo.realTrading,
    };
  }

  async getBubbleChart() {
    const fundDataInfo = await this.fundDataModel.find();

    return fundDataInfo.map((item) => ({
      fundId: item._id,
      name: item.name,
      generation: item.generation,
      totalPnL: item.totalPnL,
      survived: item.survived,
      offspring: item.offspring,
      realTrading: item.realTrading,
    }));
  }

  async getTopPics(page: number, pageSize: number) {
    const fundDataInfo = await this.fundDataModel.find();

    const allTopPics = [];

    fundDataInfo.forEach((fund) => {
      if (fund.portfolio && Array.isArray(fund.portfolio)) {
        const validPortfolio = fund.portfolio.filter((item) => {
          const valid =
            item &&
            item.totalPnL !== null &&
            item.totalPnL !== undefined &&
            !isNaN(Number(item.totalPnL)) &&
            item.totalPnL !== 0 &&
            isFinite(Number(item.totalPnL)); // Infinity 값 제외
          return valid;
        });

        validPortfolio.forEach((item) => {
          allTopPics.push({
            fundId: fund._id.toString(),
            token: item.symbol,
            address: item.address,
            strategyPrompt: fund.strategyPrompt,
            totalPnL: item.totalPnL,
            imageUrl: fund.imageUrl,
            fundName: fund.name,
          });
        });
      }
    });

    allTopPics.sort((a, b) => b.totalPnL - a.totalPnL);

    const skip = (page - 1) * pageSize;
    const paginatedResults = allTopPics.slice(skip, skip + pageSize);

    return {
      totalCount: allTopPics.length,
      results: paginatedResults,
    };
  }

  async getSearchTopPics(search: string) {
    const fundDataInfo = await this.fundDataModel.find();

    const allTopPics = [];

    fundDataInfo.forEach((fund) => {
      if (fund.portfolio && Array.isArray(fund.portfolio)) {
        const validPortfolio = fund.portfolio.filter((item) => {
          const valid =
            item &&
            item.totalPnL !== null &&
            item.totalPnL !== undefined &&
            !isNaN(Number(item.totalPnL)) &&
            item.totalPnL !== 0 &&
            isFinite(Number(item.totalPnL)); // Infinity 값 제외
          return valid;
        });

        validPortfolio.forEach((item) => {
          if (item.symbol.toLowerCase().includes(search.toLowerCase())) {
            allTopPics.push({
              fundId: fund._id.toString(),
              token: item.symbol,
              address: item.address,
              strategyPrompt: fund.strategyPrompt,
              totalPnL: item.totalPnL,
              imageUrl: fund.imageUrl,
              fundName: fund.name,
            });
          }
        });
      }
    });

    // totalPnL 기준으로 정렬
    allTopPics.sort((a, b) => b.totalPnL - a.totalPnL);

    return {
      totalCount: allTopPics.length,
      results: allTopPics,
    };
  }

  async getAiMetaData(fundId: string) {
    const fundDataInfo = await this.fundDataModel.findById(fundId);

    if (!fundDataInfo) {
      throw new BadRequestException('fund not found');
    }

    return {
      fundId: fundDataInfo._id,
      name: fundDataInfo.name,
      address: fundDataInfo.address,
      strategy: fundDataInfo.strategyPrompt,
      fundAmount: fundDataInfo.initialBalance,
      createdAt: fundDataInfo.createdAt,
    };
  }

  async getAgentStatByFundId(fundId: string) {
    const fundDataInfo = await this.fundDataModel.findById(fundId).lean();

    return {
      fundId: fundId,
      nav: fundDataInfo.nav,
      realizedProfit: fundDataInfo.realizedProfit,
      unrealizedProfit: fundDataInfo.unrealizedProfit,
      totalPnL: fundDataInfo.totalPnL,
    };
  }

  async getActivityByFundId(fundId: string, page: number, pageSize: number) {
    const tradingResultInfo = await this.tradingResultModel
      .find({ fundId })
      .sort({ createdAt: 1 });

    if (!tradingResultInfo) {
      throw new BadRequestException('fund not found');
    }

    const tokenMap = new Map<
      string,
      { totalAmount: number; totalPurchaseCost: number }
    >();

    const resultsWithPriceInfo = await Promise.all(
      tradingResultInfo.map(async (result) => {
        let profit = null;

        if (!tokenMap.has(result.address)) {
          tokenMap.set(result.address, {
            totalAmount: 0,
            totalPurchaseCost: 0,
          });
        }

        const tokenData = tokenMap.get(result.address);

        if (result.recommendation === 'buy') {
          // 매수
          tokenData.totalAmount += result.amount;
          tokenData.totalPurchaseCost += result.price * result.amount;
        } else if (result.recommendation === 'sell') {
          // 매도
          const averagePurchasePrice =
            tokenData.totalPurchaseCost / tokenData.totalAmount;
          const profitPercentage =
            ((result.price - averagePurchasePrice) / averagePurchasePrice) *
            100;
          profit = parseFloat(profitPercentage.toFixed(2));
          tokenData.totalAmount -= result.amount;
          tokenData.totalPurchaseCost -= averagePurchasePrice * result.amount;
        }

        const totalPnL = profit !== null ? profit : 0;

        return {
          type: result.recommendation,
          token: result.symbol,
          address: result.address,
          txHash: result.txHash,
          total: parseFloat((result.tradingAmount + totalPnL).toFixed(2)),
          profit: profit,
          yaps: result.analysis,
          createdAt: result.createdAt,
        };
      }),
    );

    resultsWithPriceInfo.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    const paginatedResults = resultsWithPriceInfo.slice(
      (page - 1) * pageSize,
      page * pageSize,
    );

    return {
      totalCount: resultsWithPriceInfo.length,
      results: paginatedResults,
    };
  }

  async getHoldingsByFundId(
    fundId: string,
    page: number,
    pageSize: number,
    sort?: string,
    sortOrder?: string,
  ) {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const fundDataInfo = await this.fundDataModel.findById(fundId);

    if (!fundDataInfo) {
      throw new BadRequestException('fund not found');
    }

    const results = fundDataInfo.portfolio.map((item) => ({
      token: item.symbol,
      address: item.address,
      realizedProfit: item.realizedProfit,
      unrealizedProfit: item.unrealizedProfit,
      totalPnL: item.totalPnL,
      nav: item.nav,
    }));

    // 정렬 적용
    if (sort && sortOrder) {
      results.sort((a, b) => {
        const direction = sortOrder === 'asc' ? 1 : -1;
        if (sort === 'realized') {
          return (a.realizedProfit - b.realizedProfit) * direction;
        } else if (sort === 'unrealized') {
          return (a.unrealizedProfit - b.unrealizedProfit) * direction;
        } else if (sort === 'totalPnL') {
          return (a.totalPnL - b.totalPnL) * direction;
        } else if (sort === 'nav') {
          return (a.nav - b.nav) * direction;
        }
        return 0;
      });
    }

    // 페이지네이션 적용
    const paginatedResults = results.slice(skip, skip + limit);

    return {
      totalCount: results.length,
      results: paginatedResults,
    };
  }

  async getRealTradingTopPics(page: number, pageSize: number) {
    const fundDataInfo = await this.fundDataModel.find({
      realTrading: true,
    });

    const allTopPics = [];

    fundDataInfo.forEach((fund) => {
      if (fund.portfolio && Array.isArray(fund.portfolio)) {
        const validPortfolio = fund.portfolio.filter((item) => {
          const valid =
            item &&
            item.totalPnL !== null &&
            item.totalPnL !== undefined &&
            !isNaN(Number(item.totalPnL)) &&
            isFinite(Number(item.totalPnL));
          return valid;
        });

        validPortfolio.forEach((item) => {
          allTopPics.push({
            token: item.symbol,
            totalPnL: item.totalPnL,
            fundName: fund.name,
          });
        });
      }
    });

    // totalPnL 기준으로 정렬
    allTopPics.sort((a, b) => b.totalPnL - a.totalPnL);

    // 페이지네이션 적용
    const skip = (page - 1) * pageSize;
    const paginatedResults = allTopPics.slice(skip, skip + pageSize);

    return {
      totalCount: allTopPics.length,
      results: paginatedResults,
    };
  }

  async getRealTradingGraph(fundId: string) {
    const fundDataInfo = await this.fundDataModel.findById(fundId);

    return fundDataInfo.totalPnLHistory;
  }
}
