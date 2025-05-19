import { CONSTANTS } from './../common/config/constants';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CoinData } from 'src/common/schemas/coin-data.schema';
import axios from 'axios';
import { CoinPrice } from 'src/common/schemas/coin-price.schema';
import { EmbeddingService } from 'src/embedding/embedding.service';
import { Cron } from '@nestjs/schedule';
import { TrendToken } from 'src/common/schemas/trend-token.schema';
import { FundData } from 'src/common/schemas/fund-data.schema';
import { TradingResult } from 'src/common/schemas/trading-result.schema';

@Injectable()
export class PriceService {
  constructor(
    @InjectModel('CoinData')
    private coinDataModel: Model<CoinData>,

    @InjectModel('CoinPrice')
    private coinPriceModel: Model<CoinPrice>,

    @InjectModel('TrendToken')
    private trendTokenModel: Model<TrendToken>,

    @InjectModel('FundData')
    private fundDataModel: Model<FundData>,

    @InjectModel('TradingResult')
    private tradingResultModel: Model<TradingResult>,

    private embeddingService: EmbeddingService,
    private configService: ConfigService,
  ) {}

  @Cron('50 * * * *')
  async handleCronPriceDataEmbedding() {
    try {
      // Update coin price data
      await this.processMarketDataFromCodex();

      // Execute portfolio reconstruction for all funds
      const funds = await this.fundDataModel.find({}, { _id: 1 }).lean();

      // Process each fund sequentially for portfolio cleanup and reconstruction
      for (const fund of funds) {
        try {
          const fundId = fund._id.toString();

          // Step 1: Clean up portfolio (remove tokens with 0 allocation)
          await this.cleanFundPortfolio(fundId);

          // Step 2: Reconstruct portfolio based on trading history
          await this.rebuildPortfolioFromTradingHistory(fundId);

          // Get fund data after reconstruction for debugging
          await this.fundDataModel.findById(fundId).lean();
        } catch (fundError) {
          console.error(
            `[CRON] Error processing fund ${fund._id}: ${fundError.message}`,
            fundError.stack,
          );
          // Ignore individual fund errors and continue with the next fund
          continue;
        }
      }

      // Create embeddings
    } catch (error) {
      console.error(
        `[CRON] Error in handleCronPriceDataEmbedding: ${error.message}`,
        error.stack,
      );
    }
  }

  // API endpoint exposed method
  async getMarketDataByCodex() {
    try {
      // Call basic processing logic and return result
      const result = await this.processMarketDataFromCodex();
      return { count: result.length };
    } catch (error) {
      throw new Error('Failed to complete market data processing');
    }
  }

  // Internal processing logic - method separation
  private async processMarketDataFromCodex(): Promise<any[]> {
    // Fetch trend token data
    const trendTokenInfo = await this.trendTokenModel.find().lean();

    const batchSize = 200;
    // SOL 토큰 주소를 항상 포함
    const allTokensList = [
      '"So11111111111111111111111111111111111111112:1399811149"',
      ...trendTokenInfo.map(({ address }) => `"${address}:1399811149"`),
    ];
    const totalBatches = Math.ceil(allTokensList.length / batchSize);

    let allResults = [];
    const totalData = [];

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, allTokensList.length);
      const batchTokensList = allTokensList.slice(startIndex, endIndex);

      const url = CONSTANTS.codexUrl;
      const query = {
        query: `
            {
              filterTokens(
                tokens: [${batchTokensList.join(',')}],
                limit: ${batchSize},
                offset: 0
              ) {
                count
                page
                results {
                  buyCount1
                  buyCount4
                  buyCount5m
                  buyCount12
                  buyCount24
                  change1
                  change4
                  change5m
                  change12
                  change24
                  createdAt
                  high1
                  high4
                  high5m
                  high12
                  high24
                  holders
                  lastTransaction
                  liquidity
                  low1
                  low4
                  low5m
                  low12
                  low24
                  marketCap
                  priceUSD
                  sellCount1
                  sellCount4
                  sellCount5m
                  sellCount12
                  sellCount24
                  token {
                    address
                    name
                    symbol
                  }
                  txnCount1
                  txnCount4
                  txnCount5m
                  txnCount12
                  txnCount24
                  uniqueBuys1
                  uniqueBuys4
                  uniqueBuys5m
                  uniqueBuys12
                  uniqueBuys24
                  uniqueSells1
                  uniqueSells4
                  uniqueSells5m
                  uniqueSells12
                  uniqueSells24
                  uniqueTransactions1
                  uniqueTransactions4
                  uniqueTransactions5m
                  uniqueTransactions12
                  uniqueTransactions24
                  volume1
                  volume4
                  volume5m
                  volume12
                  volume24
                  volumeChange1
                  volumeChange4
                  volumeChange5m
                  volumeChange12
                  volumeChange24
                }
              }
            }
          `,
      };

      try {
        const response = await axios.post(url, query, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: this.configService.get<string>(
              'ai-agent.codexService',
            ),
          },
        });

        if (response.data.data?.filterTokens?.results) {
          allResults = [
            ...allResults,
            ...response.data.data.filterTokens.results,
          ];
        }
      } catch (error) {
        // Error handling
      }
    }

    const transformedResults = allResults.map((result) => {
      const matchingToken = trendTokenInfo.find(
        (token) =>
          token.address.toLowerCase() === result.token.address.toLowerCase(),
      );

      return {
        ...result,
        address: result.token.address,
        name: result.token.name,
        symbol: result.token.symbol,
        category: matchingToken?.categories || [],
      };
    });

    totalData.push(...transformedResults);

    // Update coin price database
    const updatePromises = totalData.map((item) =>
      this.coinPriceModel.updateOne(
        { address: item.address },
        { $set: item },
        { upsert: true },
      ),
    );

    await Promise.all(updatePromises);

    // Clean portfolios by removing tokens with 0 allocation
    await this.cleanAllFundPortfolios();

    // Update fund financial metrics
    await this.updateAllFundsData();

    // trendToken에 있는 모든 address 목록 가져오기
    const trendTokenAddresses = trendTokenInfo.map((token) =>
      token.address.toLowerCase(),
    );

    // coinPrice에서 trendToken에 없는 토큰 삭제 (SOL 토큰은 제외)
    await this.coinPriceModel.deleteMany({
      $expr: {
        $and: [
          {
            $not: {
              $in: [{ $toLower: '$address' }, trendTokenAddresses],
            },
          },
          {
            $ne: [
              { $toLower: '$address' },
              'so11111111111111111111111111111111111111112',
            ],
          },
        ],
      },
    });

    // Create embeddings
    await this.embeddingService.createEmbeddingsCoinPrice();

    return totalData;
  }

  /**
   * Clean all fund portfolios by removing tokens with 0 allocation
   */
  async cleanAllFundPortfolios(): Promise<void> {
    try {
      // Get all funds
      const funds = await this.fundDataModel.find({}, { _id: 1 }).lean();

      // Process each fund
      for (const fund of funds) {
        await this.cleanFundPortfolio(fund._id.toString());
      }
    } catch (error) {
      // Error handling
    }
  }

  /**
   * API endpoint exposed method - manually callable
   * @param fundId
   * @returns
   */
  async cleanSingleFundPortfolio(fundId: string) {
    try {
      const result = await this.cleanFundPortfolio(fundId);
      return {
        success: true,
        message: `${result.tokensRemoved} tokens removed.`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error occurred while cleaning fund portfolio',
      };
    }
  }

  /**
   * Remove tokens with 0 allocation from a fund's portfolio using $pull
   * @param fundId Fund ID to clean
   * @returns Object with number of tokens removed
   */
  async cleanFundPortfolio(fundId: string): Promise<{ tokensRemoved: number }> {
    try {
      // Get the fund data
      const fund = await this.fundDataModel.findById(fundId).lean();
      if (!fund || !fund.portfolio || fund.portfolio.length === 0) {
        return { tokensRemoved: 0 };
      }

      // Find tokens with 0 allocation
      const zeroAllocationTokens = fund.portfolio.filter(
        (token) => token.allocation === 0,
      );

      if (zeroAllocationTokens.length === 0) {
        return { tokensRemoved: 0 };
      }

      // Process each token with 0 allocation - sell it at current price
      for (const token of zeroAllocationTokens) {
        try {
          // Get current price
          const coinPrice = await this.coinPriceModel
            .findOne({
              address: token.address,
            })
            .lean();

          if (coinPrice && token.amount !== 0) {
            // Process only if remaining amount is not 0
            const price = Number(coinPrice.priceUSD);
            let sellAmount = 0;

            // Create sell order if there's remaining amount
            if (token.amount > 0) {
              sellAmount = -token.amount; // Use negative value to indicate sell
            }
            // Skip if amount is already negative (previously processed incorrectly)
            else if (token.amount < 0) {
              // Skip to prevent duplicate transaction records
              continue;
            }
            // Skip if amount is 0 (already sold through other means)
            else {
              // No need to create transaction record
              continue;
            }

            // Get total trading amount (sum of all investment amounts so far)
            const totalTradingAmount = await this.getTotalTradingAmount(
              fundId,
              token.address,
            );

            // Force create trading record - without duplicate check
            await this.tradingResultModel.create({
              fundId,
              address: token.address,
              name: token.symbol,
              symbol: token.symbol,
              amount: sellAmount,
              analysis:
                'Complete position exit due to portfolio rebalancing - token with zero allocation',
              price,
              allocation: 0,
              tradingAmount: totalTradingAmount, // Use total investment amount
              recommendation: 'sell',
              createdAt: new Date(),
            });
          }
        } catch (error) {
          console.error(
            `[CLEANUP] Error processing ${token.symbol}: ${error.message}`,
            error.stack,
          );
          // Continue processing other tokens even if error occurs
        }
      }

      // Step 1: First remove all tokens with 0 allocation from portfolio
      await this.fundDataModel.updateOne(
        { _id: fundId },
        {
          $pull: {
            portfolio: { allocation: 0 },
          },
        },
      );

      // Step 2: Then reconstruct portfolio based on trading history
      await this.rebuildPortfolioFromTradingHistory(fundId);

      // Step 3: Final check - remove any remaining tokens with 0 allocation
      await this.fundDataModel.updateOne(
        { _id: fundId },
        {
          $pull: {
            portfolio: { allocation: 0 },
          },
        },
      );

      return { tokensRemoved: zeroAllocationTokens.length };
    } catch (error) {
      console.error(
        `[CLEANUP] Error in cleanFundPortfolio: ${error.message}`,
        error.stack,
      );
      return { tokensRemoved: 0 };
    }
  }

  /**
   * Calculate total investment amount for a specific token
   * @param fundId Fund ID
   * @param tokenAddress Token address
   * @returns Total investment amount
   */
  async getTotalTradingAmount(
    fundId: string,
    tokenAddress: string,
  ): Promise<number> {
    try {
      // Get all buy transactions for this token
      const buyTrades = await this.tradingResultModel
        .find({
          fundId,
          address: tokenAddress,
          amount: { $gt: 0 }, // Buy transactions only (amount > 0)
        })
        .lean();

      // Get the tradingAmount from the latest transaction (time-sorted)
      const latestTrade = await this.tradingResultModel
        .findOne({
          fundId,
          address: tokenAddress,
        })
        .sort({ createdAt: -1 })
        .lean();

      // Get token info from the portfolio
      const fundData = await this.fundDataModel.findById(fundId).lean();
      const portfolioToken = fundData?.portfolio?.find(
        (token) => token.address.toLowerCase() === tokenAddress.toLowerCase(),
      );

      // Priority order:
      // 1. tradingAmount value from portfolio
      // 2. tradingAmount value from most recent transaction
      // 3. Sum of all buy transactions (price * amount)
      if (portfolioToken?.tradingAmount) {
        return portfolioToken.tradingAmount;
      } else if (latestTrade?.tradingAmount) {
        return latestTrade.tradingAmount;
      } else {
        // Sum up all buy transaction amounts
        let totalBuyValue = 0;
        for (const trade of buyTrades) {
          totalBuyValue += trade.amount * trade.price;
        }
        return totalBuyValue > 0 ? totalBuyValue : 0;
      }
    } catch (error) {
      console.error(`Error getting total trading amount: ${error.message}`);
      return 0;
    }
  }

  /**
   * Update data for all funds, including recalculating metrics after cleaning
   */
  async updateAllFundsData(): Promise<void> {
    try {
      const fundDataInfo = await this.fundDataModel.find();

      for (const fund of fundDataInfo) {
        try {
          const fundId = fund._id.toString();

          // Calculate fund metrics based on realTrading flag
          const fundMetrics = fund.realTrading
            ? await this.getRealTradingFundMetrics(fundId)
            : await this.getSimulatedFundMetrics(fundId);

          // Validate values - 모든 숫자 값에 대해 NaN 체크 추가
          let finalNav = fundMetrics.nav;
          let finalRealizedProfit = fundMetrics.realizedProfit;
          let finalUnrealizedProfit = fundMetrics.unrealizedProfit;
          let finalTotalPnL = fundMetrics.totalPnL;
          let finalEffectiveInvestment = fundMetrics.effectiveInvestment;
          let finalTotalInvestmentAmount = fundMetrics.totalInvestmentAmount;

          // NaN 체크 및 기본값 설정
          if (isNaN(finalNav) || !isFinite(finalNav)) {
            finalNav = fund.initialBalance || 0;
          }

          if (isNaN(finalRealizedProfit) || !isFinite(finalRealizedProfit)) {
            finalRealizedProfit = 0;
          }

          if (
            isNaN(finalUnrealizedProfit) ||
            !isFinite(finalUnrealizedProfit)
          ) {
            finalUnrealizedProfit = 0;
          }

          if (isNaN(finalTotalPnL) || !isFinite(finalTotalPnL)) {
            finalTotalPnL = 0;
          }

          if (
            isNaN(finalEffectiveInvestment) ||
            !isFinite(finalEffectiveInvestment)
          ) {
            finalEffectiveInvestment = fund.initialBalance || 0;
          }

          if (
            isNaN(finalTotalInvestmentAmount) ||
            !isFinite(finalTotalInvestmentAmount)
          ) {
            finalTotalInvestmentAmount = fund.initialBalance || 0;
          }

          // 음수 NAV 방지
          if (finalNav < 0) {
            finalNav = 0;
          }

          // Update fund data with all relevant metrics
          const updateData = {
            nav: parseFloat(finalNav.toFixed(2)),
            realizedProfit: parseFloat(finalRealizedProfit.toFixed(2)),
            unrealizedProfit: parseFloat(finalUnrealizedProfit.toFixed(2)),
            totalPnL: parseFloat(finalTotalPnL.toFixed(2)),
            survived: fund.survived === false ? false : finalTotalPnL > -95,
            effectiveInvestment: parseFloat(
              finalEffectiveInvestment.toFixed(2),
            ),
            totalInvestmentAmount: parseFloat(
              finalTotalInvestmentAmount.toFixed(2),
            ),
            totalPnLHistory: [
              ...(fund.totalPnLHistory || []).slice(-799),
              {
                value: parseFloat(finalTotalPnL.toFixed(2)),
                timestamp: new Date(),
              },
            ],
          };

          // 먼저 totalPnL을 업데이트
          await this.fundDataModel.findByIdAndUpdate(
            fundId,
            { $set: { totalPnL: updateData.totalPnL } },
            { new: true },
          );

          // 그 다음 나머지 필드 업데이트
          await this.fundDataModel.findByIdAndUpdate(
            fundId,
            {
              $set: {
                nav: updateData.nav,
                realizedProfit: updateData.realizedProfit,
                unrealizedProfit: updateData.unrealizedProfit,
                survived: updateData.survived,
                effectiveInvestment: updateData.effectiveInvestment,
                totalInvestmentAmount: updateData.totalInvestmentAmount,
                totalPnLHistory: updateData.totalPnLHistory,
              },
            },
            { new: true },
          );
        } catch (fundError) {
          console.error(
            `[UPDATE] Error updating fund ${fund._id}: ${fundError.message}`,
            fundError.stack,
          );
        }
      }
    } catch (error) {
      console.error(
        `[UPDATE] Error in updateAllFundsData: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to update fund metrics');
    }
  }

  /**
   * Get metrics for real trading funds
   */
  async getRealTradingFundMetrics(fundId: string) {
    const fundDataInfo = await this.fundDataModel.findById(fundId).lean();
    if (!fundDataInfo) {
      return this.getEmptyFundMetrics(fundId);
    }

    // Get SOL price
    const solToken = await this.coinPriceModel
      .findOne({
        address: 'So11111111111111111111111111111111111111112',
      })
      .lean();

    if (!solToken || !solToken.priceUSD) {
      console.error('[REAL_TRADING] SOL price not found');
      return this.getEmptyFundMetrics(fundId);
    }

    const solPrice = Number(solToken.priceUSD);

    // Get current portfolio token stats
    const holdings = await this.getHoldingsByFundId(fundId, 1, 1000);
    const statData = holdings.results || [];

    // Get realized profit from all tokens, including fully sold ones
    const allRealizedProfit = await this.getTotalRealizedProfit(fundId);

    // Calculate unrealized profit from current portfolio tokens
    let unrealizedProfit = statData.reduce(
      (acc, token) =>
        acc + (isNaN(token.unrealizedProfit) ? 0 : token.unrealizedProfit),
      0,
    );

    // NaN 체크
    if (isNaN(unrealizedProfit)) {
      unrealizedProfit = 0;
    }

    // Formatted values - NaN 방지
    const formattedRealizedProfit = isNaN(allRealizedProfit)
      ? 0
      : parseFloat(allRealizedProfit.toFixed(2));
    let formattedUnrealizedProfit = isNaN(unrealizedProfit)
      ? 0
      : parseFloat(unrealizedProfit.toFixed(2));

    // 초기 투자 금액과 총 이익 계산 (SOL 가격 적용)
    const initialBalance = isNaN(fundDataInfo.initialBalance)
      ? 0
      : fundDataInfo.initialBalance * solPrice;
    const totalProfit = formattedRealizedProfit + formattedUnrealizedProfit;

    // 공식 기반 NAV 계산 (초기 투자 금액 + 총 이익)
    const formulaBasedNav = initialBalance + totalProfit;

    // 토큰 기반 NAV (각 토큰 NAV의 합) - holdings.totalNav 사용, NaN 체크
    let tokenBasedNav = isNaN(holdings.totalNav) ? 0 : holdings.totalNav;

    // 현금 잔액 (SOL 가격 적용)
    const cashBalance = isNaN(fundDataInfo.balance)
      ? 0
      : fundDataInfo.balance * solPrice;

    // 토큰 기반 NAV가 공식 기반 NAV를 초과하는 경우 조정
    if (tokenBasedNav > formulaBasedNav) {
      // 토큰 기반 NAV 조정 - 공식 기반 NAV에 맞게 조정
      if (statData.length > 0 && tokenBasedNav > 0) {
        // NAV 조정 비율 계산 - 현금 잔액을 제외한 값으로 조정
        const adjustmentRatio = formulaBasedNav / tokenBasedNav;

        // 각 토큰의 NAV 조정
        statData.forEach((token) => {
          token.nav = parseFloat((token.nav * adjustmentRatio).toFixed(2));

          // unrealizedProfit도 동일한 비율로 조정
          if (token.unrealizedProfit !== 0) {
            token.unrealizedProfit = parseFloat(
              (token.unrealizedProfit * adjustmentRatio).toFixed(2),
            );
          }
        });

        // 조정된 tokenBasedNav 재계산
        tokenBasedNav = statData.reduce(
          (acc, token) => acc + (isNaN(token.nav) ? 0 : token.nav),
          0,
        );

        // 조정된 unrealizedProfit 재계산
        const adjustedUnrealizedProfit = statData.reduce(
          (acc, token) =>
            acc + (isNaN(token.unrealizedProfit) ? 0 : token.unrealizedProfit),
          0,
        );

        // 조정된 값 적용
        formattedUnrealizedProfit = parseFloat(
          adjustedUnrealizedProfit.toFixed(2),
        );
      }
    }

    // 최종 NAV 결정 (공식 기반 NAV + 현금 잔액 사용)
    let finalNav = formulaBasedNav + cashBalance;

    // NaN 체크
    if (isNaN(finalNav)) {
      finalNav = initialBalance + cashBalance;
    }

    // totalPnL 계산 (총 손익 / 초기 투자금액)
    let totalPnL = 0;
    if (initialBalance > 0) {
      // 현금 비율 계산 (balance / initialBalance)
      const cashRatio = (cashBalance / initialBalance) * 100;

      // 토큰들의 총 allocation
      const tokenAllocation = statData.reduce(
        (sum, token) => sum + (token.allocation || 0),
        0,
      );

      // 총 allocation (토큰 + 현금)
      const totalAllocation = tokenAllocation + cashRatio;

      if (totalAllocation > 0) {
        // 각 토큰의 totalPnL을 재조정된 allocation 비중으로 계산
        totalPnL = statData.reduce((sum, token) => {
          const adjustedWeight = (token.allocation || 0) / totalAllocation;
          return sum + (token.totalPnL || 0) * adjustedWeight;
        }, 0);

        // 현금의 PnL도 계산 (현금은 0% PnL)
        const cashWeight = cashRatio / totalAllocation;
        totalPnL += 0 * cashWeight; // 현금은 PnL이 0
      }

      // 손실 한도 (-100%)
      if (totalPnL < -100) totalPnL = -100;
    }

    // NaN 체크
    if (isNaN(totalPnL)) {
      totalPnL = 0;
    }

    // 총 투자 금액 계산 (초기 투자금액과 동일하게 설정)
    const totalInvestmentAmount = parseFloat(initialBalance.toFixed(2));

    return {
      fundId: fundId,
      nav: parseFloat(finalNav.toFixed(2)),
      realizedProfit: formattedRealizedProfit,
      unrealizedProfit: formattedUnrealizedProfit,
      totalPnL: totalPnL,
      effectiveInvestment: parseFloat(initialBalance.toFixed(2)),
      initialBalance: fundDataInfo.initialBalance * solPrice, // SOL 가격 적용
      totalInvestmentAmount: totalInvestmentAmount,
      totalNav: parseFloat(finalNav.toFixed(2)),
      tokenBasedNav: parseFloat(tokenBasedNav.toFixed(2)),
      tokens: statData,
    };
  }

  /**
   * Get metrics for simulated trading funds
   */
  async getSimulatedFundMetrics(fundId: string) {
    const fundDataInfo = await this.fundDataModel.findById(fundId).lean();
    if (!fundDataInfo) {
      return this.getEmptyFundMetrics(fundId);
    }

    // Get current portfolio token stats
    const holdings = await this.getHoldingsByFundId(fundId, 1, 1000);
    const statData = holdings.results || [];

    // Get realized profit from all tokens, including fully sold ones
    const allRealizedProfit = await this.getTotalRealizedProfit(fundId);

    // Calculate unrealized profit from current portfolio tokens
    let unrealizedProfit = statData.reduce(
      (acc, token) =>
        acc + (isNaN(token.unrealizedProfit) ? 0 : token.unrealizedProfit),
      0,
    );

    // NaN 체크
    if (isNaN(unrealizedProfit)) {
      unrealizedProfit = 0;
    }

    // Formatted values - NaN 방지
    const formattedRealizedProfit = isNaN(allRealizedProfit)
      ? 0
      : parseFloat(allRealizedProfit.toFixed(2));
    let formattedUnrealizedProfit = isNaN(unrealizedProfit)
      ? 0
      : parseFloat(unrealizedProfit.toFixed(2));

    // 초기 투자 금액과 총 이익 계산
    const initialBalance = isNaN(fundDataInfo.initialBalance)
      ? 0
      : fundDataInfo.initialBalance;
    const totalProfit = formattedRealizedProfit + formattedUnrealizedProfit;

    // 공식 기반 NAV 계산 (초기 투자 금액 + 총 이익)
    const formulaBasedNav = initialBalance + totalProfit;

    // 토큰 기반 NAV (각 토큰 NAV의 합) - holdings.totalNav 사용, NaN 체크
    let tokenBasedNav = isNaN(holdings.totalNav) ? 0 : holdings.totalNav;

    // 현금 잔액
    const cashBalance = isNaN(fundDataInfo.balance) ? 0 : fundDataInfo.balance;

    // 토큰 기반 NAV가 공식 기반 NAV를 초과하는 경우 조정
    if (tokenBasedNav > formulaBasedNav) {
      // 토큰 기반 NAV 조정 - 공식 기반 NAV에 맞게 조정
      if (statData.length > 0 && tokenBasedNav > 0) {
        // NAV 조정 비율 계산 - 현금 잔액을 제외한 값으로 조정
        const adjustmentRatio = formulaBasedNav / tokenBasedNav;

        // 각 토큰의 NAV 조정
        statData.forEach((token) => {
          token.nav = parseFloat((token.nav * adjustmentRatio).toFixed(2));

          // unrealizedProfit도 동일한 비율로 조정
          if (token.unrealizedProfit !== 0) {
            token.unrealizedProfit = parseFloat(
              (token.unrealizedProfit * adjustmentRatio).toFixed(2),
            );
          }
        });

        // 조정된 tokenBasedNav 재계산
        tokenBasedNav = statData.reduce(
          (acc, token) => acc + (isNaN(token.nav) ? 0 : token.nav),
          0,
        );

        // 조정된 unrealizedProfit 재계산
        const adjustedUnrealizedProfit = statData.reduce(
          (acc, token) =>
            acc + (isNaN(token.unrealizedProfit) ? 0 : token.unrealizedProfit),
          0,
        );

        // 조정된 값 적용
        formattedUnrealizedProfit = parseFloat(
          adjustedUnrealizedProfit.toFixed(2),
        );
      }
    }

    // 최종 NAV 결정 (공식 기반 NAV + 현금 잔액 사용)
    let finalNav = formulaBasedNav + cashBalance;

    // NaN 체크
    if (isNaN(finalNav)) {
      finalNav = initialBalance + cashBalance;
    }

    // totalPnL 계산 (총 손익 / 초기 투자금액)
    let totalPnL = 0;
    if (initialBalance > 0) {
      totalPnL = (totalProfit / initialBalance) * 100;

      // 손실 한도 (-100%)
      if (totalPnL < -100) totalPnL = -100;
    }

    // NaN 체크
    if (isNaN(totalPnL)) {
      totalPnL = 0;
    }

    // 총 투자 금액 계산 (초기 투자금액과 동일하게 설정)
    const totalInvestmentAmount = parseFloat(initialBalance.toFixed(2));

    return {
      fundId: fundId,
      nav: parseFloat(finalNav.toFixed(2)),
      realizedProfit: formattedRealizedProfit,
      unrealizedProfit: formattedUnrealizedProfit,
      totalPnL: totalPnL,
      effectiveInvestment: parseFloat(initialBalance.toFixed(2)),
      initialBalance: fundDataInfo.initialBalance,
      totalInvestmentAmount: totalInvestmentAmount,
      totalNav: parseFloat(finalNav.toFixed(2)),
      tokenBasedNav: parseFloat(tokenBasedNav.toFixed(2)),
      tokens: statData,
    };
  }

  /**
   * Get empty fund metrics
   */
  private getEmptyFundMetrics(fundId: string) {
    return {
      fundId,
      nav: 0,
      realizedProfit: 0,
      unrealizedProfit: 0,
      totalPnL: 0,
      tokens: [],
      effectiveInvestment: 0,
      initialBalance: 0,
      totalNav: 0,
      tokenBasedNav: 0,
      totalInvestmentAmount: 0,
    };
  }

  /**
   * Rebuild fund portfolio from trading history
   * @param fundId Fund ID
   */
  async rebuildPortfolioFromTradingHistory(fundId: string): Promise<void> {
    try {
      // Get fund data to determine initial investment and current balance
      const fundData = await this.fundDataModel.findById(fundId).lean();
      if (!fundData) {
        return;
      }

      // Get all trading history for this fund, sorted by creation date
      const allTrades = await this.tradingResultModel
        .find({ fundId })
        .sort({ createdAt: 1 })
        .lean();

      // Map to track token trades
      const tokenTrades = new Map();

      // 메서드 시작에 모든 필요한 변수 선언
      let totalRealizedProfit = 0;
      let totalUnrealizedProfit = 0;
      let totalNav = fundData.balance || 0; // 현금 잔액으로 초기화
      let newPortfolio = [];

      // 거래 기록 처리 부분 (트레이딩 로직) - 변경하지 않음
      allTrades.forEach((trade) => {
        if (!tokenTrades.has(trade.address)) {
          tokenTrades.set(trade.address, {
            symbol: trade.symbol || 'Unknown',
            address: trade.address,
            amount: 0,
            allocation: trade.allocation || 0,
            tradingAmount: 0,
            totalBuyCost: 0, // Total purchase cost
            totalBuyAmount: 0, // Total purchase amount
            totalSellValue: 0, // Total sell value
            totalSellAmount: 0, // Total sell amount
            buyQueue: [], // FIFO buy queue
            realizedProfit: 0,
            unrealizedProfit: 0,
            nav: 0,
            lastUpdate: trade.createdAt,
          });
        }

        const token = tokenTrades.get(trade.address);

        // Process based on transaction type
        if (trade.amount > 0) {
          // Buy transaction
          token.amount += trade.amount;
          token.totalBuyCost += trade.amount * trade.price;
          token.totalBuyAmount += trade.amount;

          // Add to FIFO queue for calculation
          token.buyQueue.push({
            amount: trade.amount,
            price: trade.price,
            date: trade.createdAt,
          });

          // Update tradingAmount if available
          if (trade.tradingAmount !== undefined) {
            token.tradingAmount = trade.tradingAmount;
          }
        } else {
          // Sell transaction
          const sellAmount = Math.abs(trade.amount);
          const sellPrice = trade.price;
          const sellValue = sellAmount * sellPrice;

          token.totalSellValue += sellValue;
          token.totalSellAmount += sellAmount;
          token.amount -= sellAmount; // Update remaining amount

          // Calculate realized profit using FIFO
          let sellAmountRemaining = sellAmount;
          let profitFromThisSell = 0;

          while (sellAmountRemaining > 0 && token.buyQueue.length > 0) {
            const oldestBuy = token.buyQueue[0];

            if (oldestBuy.amount <= sellAmountRemaining) {
              // Fully consume oldest buy order
              const profit = oldestBuy.amount * (sellPrice - oldestBuy.price);
              profitFromThisSell += profit;
              sellAmountRemaining -= oldestBuy.amount;
              token.buyQueue.shift();
            } else {
              // Partially consume buy order
              const profit =
                sellAmountRemaining * (sellPrice - oldestBuy.price);
              profitFromThisSell += profit;
              oldestBuy.amount -= sellAmountRemaining;
              sellAmountRemaining = 0;
            }
          }

          // Add profit from this sell
          token.realizedProfit += profitFromThisSell;

          // 전체 실현 이익에 추가
          totalRealizedProfit += profitFromThisSell;

          // Update tradingAmount if available
          if (trade.tradingAmount !== undefined) {
            token.tradingAmount = trade.tradingAmount;
          }

          // Update allocation (if allocation is 0 in last sell, token is completely sold)
          if (trade.allocation !== undefined) {
            token.allocation = trade.allocation;
          }
        }

        // Update latest allocation
        if (trade.allocation !== undefined) {
          token.allocation = trade.allocation;
        }

        // Record last update time
        token.lastUpdate = trade.createdAt;
      });

      // Calculate unrealized profit and NAV using current price info
      const tokenEntries = Array.from(tokenTrades.entries());

      // Find tokens with allocation 0 but remaining amount to create sell transactions
      const tokensToSellOff = [];

      // 각 토큰에 대해 NAV 및 unrealizedProfit 계산
      for (const [address, token] of tokenEntries) {
        // Calculate total investment amount (sum of all buy costs)
        const totalInvestment = token.totalBuyCost;

        // Skip further calculation if investment amount is 0
        if (totalInvestment === 0) {
          continue;
        }

        if (token.amount > 0) {
          // Get current price info
          const priceInfo = await this.coinPriceModel
            .findOne({ address })
            .lean();

          if (priceInfo) {
            // Calculate current price and average buy price
            const currentPrice = Number(priceInfo.priceUSD);

            // Calculate average price and total amount for remaining buy orders
            let remainingBuyValue = 0;
            let remainingBuyAmount = 0;

            token.buyQueue.forEach((buy) => {
              remainingBuyValue += buy.amount * buy.price;
              remainingBuyAmount += buy.amount;
            });

            const avgBuyPrice =
              remainingBuyAmount > 0
                ? remainingBuyValue / remainingBuyAmount
                : 0;

            // Calculate unrealized profit
            token.unrealizedProfit =
              (currentPrice - avgBuyPrice) * remainingBuyAmount;

            // 중요: 토큰 NAV 계산 (투자 금액 + 수익)
            const totalTokenProfit =
              token.realizedProfit + token.unrealizedProfit;
            token.nav = Math.max(0, totalInvestment + totalTokenProfit);

            // If allocation is 0, treat as fully sold and create transaction record
            if (token.allocation === 0 && remainingBuyAmount > 0) {
              // 이하 코드는 기존 로직 유지
              tokensToSellOff.push({
                symbol: token.symbol,
                address: token.address,
                amount: remainingBuyAmount,
                price: currentPrice,
                tradingAmount: totalInvestment,
                unrealizedProfit: token.unrealizedProfit,
              });

              // Calculate realized profit if sold at current price
              const additionalProfit = token.unrealizedProfit;
              token.realizedProfit += additionalProfit;
              token.unrealizedProfit = 0;

              // Update NAV after moving unrealized profit to realized profit
              token.nav = Math.max(0, totalInvestment + token.realizedProfit);

              // Set amount to 0
              token.amount = 0;
              // Clear queue
              token.buyQueue = [];
            }
          }
        } else {
          // 토큰 잔액이 0인 경우에도 NAV 계산 (투자금액 + 실현이익)
          token.nav = Math.max(0, totalInvestment + token.realizedProfit);
        }
      }

      // 토큰 판매 및 거래 기록 생성 부분 추가
      // Create transaction records for tokens with allocation 0
      for (const tokenToSell of tokensToSellOff) {
        try {
          // Check if identical sell record already exists (prevent duplicates)
          const existingSellOff = await this.tradingResultModel
            .findOne({
              fundId,
              address: tokenToSell.address,
              allocation: 0,
              amount: -tokenToSell.amount, // Check if already sold with exact same amount
              createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Within last 24 hours
            })
            .lean();

          if (!existingSellOff) {
            // Create transaction record
            await this.tradingResultModel.create({
              fundId,
              address: tokenToSell.address,
              name: tokenToSell.symbol,
              symbol: tokenToSell.symbol,
              amount: -tokenToSell.amount, // Use negative value to indicate sell
              analysis:
                'Complete position exit due to portfolio rebalancing - token with zero allocation',
              price: tokenToSell.price,
              allocation: 0,
              tradingAmount: tokenToSell.tradingAmount, // Use total investment amount
              recommendation: 'sell',
              createdAt: new Date(),
            });
          }
        } catch (error) {
          console.error(
            `[REBUILD] Error creating sell order for ${tokenToSell.symbol}: ${error.message}`,
            error.stack,
          );
        }
      }

      // 포트폴리오 구성 부분
      newPortfolio = [];

      // Process each token for portfolio
      tokenEntries.forEach(([, token]) => {
        // Total initial investment amount (sum of all buy costs)
        const totalInvestment = token.totalBuyCost;

        // Important: only include tokens with allocation > 0 AND amount > 0 OR realizedProfit != 0
        if (
          (token.allocation > 0 && token.amount > 0) ||
          token.realizedProfit !== 0
        ) {
          // 손실 제한 로직 - 기존 코드 유지
          if (totalInvestment > 0 && token.realizedProfit < -totalInvestment) {
            token.realizedProfit = -totalInvestment;
          }

          // Limit unrealized losses only (can't lose more than remaining investment)
          const remainingInvestment = totalInvestment + token.realizedProfit;
          if (
            remainingInvestment > 0 &&
            token.unrealizedProfit < -remainingInvestment
          ) {
            token.unrealizedProfit = -remainingInvestment;

            // NAV 업데이트 - 제한된 미실현 이익 반영
            token.nav = Math.max(
              0,
              totalInvestment + token.realizedProfit + token.unrealizedProfit,
            );
          }

          // Calculate totalPnL
          const tokenTotalProfit =
            token.realizedProfit + token.unrealizedProfit;
          let totalPnL =
            totalInvestment > 0
              ? (tokenTotalProfit / totalInvestment) * 100
              : 0;

          // Limit losses only (-100%), don't limit profits
          if (totalPnL < -100) {
            totalPnL = -100;
          }

          // Add to portfolio
          newPortfolio.push({
            symbol: token.symbol,
            address: token.address,
            amount: token.amount,
            allocation: token.allocation,
            tradingAmount: totalInvestment, // Set initial total investment amount
            totalPnL: parseFloat(totalPnL.toFixed(2)),
            realizedProfit: parseFloat(token.realizedProfit.toFixed(2)),
            unrealizedProfit: parseFloat(token.unrealizedProfit.toFixed(2)),
            nav: parseFloat(token.nav.toFixed(2)), // 계산된 NAV 사용
          });

          // Include in statistics
          totalNav += token.nav;
          totalUnrealizedProfit += token.unrealizedProfit;
        }
      });

      // 포트폴리오 내 모든 토큰의 NAV 합계 계산
      const portfolioNavSum = newPortfolio.reduce((sum, token) => {
        // NaN 체크 추가
        const tokenNav = isNaN(token.nav) ? 0 : token.nav;
        return sum + tokenNav;
      }, 0);

      // 포트폴리오 NAV 합계가 초기 투자 금액과 실현/미실현 이익의 합을 초과하는 경우 조정
      const maxAllowedNav =
        fundData.initialBalance + totalRealizedProfit + totalUnrealizedProfit;

      if (portfolioNavSum > maxAllowedNav) {
        // NAV 값 조정 비율 계산
        const adjustmentRatio = maxAllowedNav / portfolioNavSum;

        // 각 토큰의 NAV 조정
        newPortfolio.forEach((token) => {
          if (isNaN(token.nav)) {
            token.nav = 0;
          } else {
            token.nav = parseFloat((token.nav * adjustmentRatio).toFixed(2));
          }

          // unrealizedProfit도 동일한 비율로 조정
          if (token.unrealizedProfit !== 0) {
            if (isNaN(token.unrealizedProfit)) {
              token.unrealizedProfit = 0;
            } else {
              token.unrealizedProfit = parseFloat(
                (token.unrealizedProfit * adjustmentRatio).toFixed(2),
              );
            }
          }
        });

        // 조정된 totalUnrealizedProfit 재계산
        totalUnrealizedProfit = newPortfolio.reduce(
          (sum, token) =>
            sum + (isNaN(token.unrealizedProfit) ? 0 : token.unrealizedProfit),
          0,
        );

        // 조정된 포트폴리오 NAV 합계 계산
        const adjustedNavSum = newPortfolio.reduce(
          (sum, token) => sum + (isNaN(token.nav) ? 0 : token.nav),
          0,
        );

        // totalNav 재계산 (현금 잔액 + 조정된 포트폴리오 NAV)
        totalNav = (fundData.balance || 0) + adjustedNavSum;
      }

      // NaN 체크 추가
      if (isNaN(totalNav)) totalNav = fundData.balance || 0;
      if (isNaN(totalRealizedProfit)) totalRealizedProfit = 0;
      if (isNaN(totalUnrealizedProfit)) totalUnrealizedProfit = 0;

      // Update fundData - totalPnL 업데이트 제외
      await this.fundDataModel.findByIdAndUpdate(
        fundId,
        {
          portfolio: newPortfolio,
          nav: parseFloat(totalNav.toFixed(2)),
          realizedProfit: parseFloat(totalRealizedProfit.toFixed(2)),
          unrealizedProfit: parseFloat(totalUnrealizedProfit.toFixed(2)),
          survived:
            fundData.survived === false ? false : fundData.totalPnL > -95,
        },
        { new: true },
      );

      // Final check - remove any remaining tokens with allocation 0
      await this.fundDataModel.updateOne(
        { _id: fundId },
        {
          $pull: {
            portfolio: { allocation: 0 },
          },
        },
      );

      return;
    } catch (error) {
      console.error(
        `[REBUILD] Error in rebuildPortfolioFromTradingHistory: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to rebuild portfolio from trading history');
    }
  }

  /**
   * Get holdings by fund ID
   * @param fundId Fund ID
   * @param page Page number
   * @param limit Items per page
   * @returns Holdings data
   */
  async getHoldingsByFundId(fundId: string, page = 1, limit = 10) {
    try {
      const fund = await this.fundDataModel.findById(fundId).lean();
      if (!fund) {
        return {
          totalItems: 0,
          totalPages: 0,
          currentPage: page,
          results: [],
          totalNav: 0,
        };
      }

      const portfolio = fund.portfolio || [];
      const totalItems = portfolio.length;
      const totalPages = Math.ceil(totalItems / limit);

      // Calculate total NAV from portfolio items
      const totalNav = portfolio.reduce(
        (acc, token) => acc + (token.nav || 0),
        0,
      );

      // Apply pagination
      const results = portfolio
        .sort((a, b) => (b.realizedProfit || 0) - (a.realizedProfit || 0))
        .slice((page - 1) * limit, page * limit);

      return {
        totalItems,
        totalPages,
        currentPage: page,
        results,
        totalNav,
      };
    } catch (error) {
      console.error(`Error getting holdings: ${error.message}`);
      return {
        totalItems: 0,
        totalPages: 0,
        currentPage: page,
        results: [],
        totalNav: 0,
      };
    }
  }

  /**
   * Get total realized profit from all tokens including those fully sold
   * @param fundId Fund ID to calculate total realized profit for
   * @returns Total realized profit
   */
  async getTotalRealizedProfit(fundId: string): Promise<number> {
    try {
      // Get all trading history for this fund, sorted by creation date
      const allTrades = await this.tradingResultModel
        .find({ fundId })
        .sort({ createdAt: 1 })
        .lean();

      if (allTrades.length === 0) {
        return 0;
      }

      // Map to track token trades
      const tokenTrades = new Map();

      // Track total realized profit
      let totalRealizedProfit = 0;

      // Process all trades using FIFO method
      allTrades.forEach((trade) => {
        if (!tokenTrades.has(trade.address)) {
          tokenTrades.set(trade.address, {
            buyQueue: [], // FIFO buy queue
            realizedProfit: 0,
          });
        }

        const token = tokenTrades.get(trade.address);

        // Process based on transaction type
        if (trade.amount > 0) {
          // Buy transaction - add to FIFO queue
          token.buyQueue.push({
            amount: trade.amount,
            price: trade.price,
            date: trade.createdAt,
          });
        } else {
          // Sell transaction
          const sellAmount = Math.abs(trade.amount);
          const sellPrice = trade.price;
          let sellAmountRemaining = sellAmount;
          let profitFromThisSell = 0;

          while (sellAmountRemaining > 0 && token.buyQueue.length > 0) {
            const oldestBuy = token.buyQueue[0];

            if (oldestBuy.amount <= sellAmountRemaining) {
              // Fully consume oldest buy order
              const profit = oldestBuy.amount * (sellPrice - oldestBuy.price);
              profitFromThisSell += profit;
              sellAmountRemaining -= oldestBuy.amount;
              token.buyQueue.shift();
            } else {
              // Partially consume buy order
              const profit =
                sellAmountRemaining * (sellPrice - oldestBuy.price);
              profitFromThisSell += profit;
              oldestBuy.amount -= sellAmountRemaining;
              sellAmountRemaining = 0;
            }
          }

          // Add profit from this sell to token's realized profit
          token.realizedProfit += profitFromThisSell;
        }
      });

      // Sum up realized profits from all tokens
      tokenTrades.forEach((token) => {
        totalRealizedProfit += token.realizedProfit;
      });

      return totalRealizedProfit;
    } catch (error) {
      console.error(`Error getting total realized profit: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get realized profit by fund ID
   * @param fundId Fund ID
   * @returns Total realized profit
   */
  async getRealizedProfitByFundId(fundId: string): Promise<number> {
    // 기본적으로 getTotalRealizedProfit 함수를 사용하여 구현
    return this.getTotalRealizedProfit(fundId);
  }

  /**
   * Analyze trading history for a specific token
   * For debugging and diagnostic purposes
   * @param fundId Fund ID
   * @param tokenSymbol Token symbol to analyze
   */
  async analyzeTokenTrades(fundId: string, tokenSymbol: string) {
    try {
      // Get trading history
      const trades = await this.tradingResultModel
        .find({ fundId, symbol: tokenSymbol })
        .sort({ createdAt: 1 })
        .lean();

      if (trades.length === 0) {
        return {
          success: false,
          message: 'No trading history',
          trades: [], // Explicitly return empty array
          tradeHistory: [], // Explicitly return empty array
        };
      }

      // Trading summary information
      let totalBuyAmount = 0;
      let totalBuyValue = 0;
      let totalSellAmount = 0;
      let totalSellValue = 0;

      // Process trading history
      const tradeHistory = trades.map((trade) => {
        const amount = Math.abs(trade.amount);
        const value = amount * trade.price;

        if (trade.amount > 0) {
          totalBuyAmount += amount;
          totalBuyValue += value;
        } else {
          totalSellAmount += amount;
          totalSellValue += value;
        }

        return {
          type: trade.amount > 0 ? 'BUY' : 'SELL',
          amount: amount,
          price: trade.price,
          value: value,
          date: trade.createdAt,
          allocation: trade.allocation,
          tradingAmount: trade.tradingAmount,
        };
      });

      // Profit analysis
      const avgBuyPrice =
        totalBuyAmount > 0 ? totalBuyValue / totalBuyAmount : 0;
      const avgSellPrice =
        totalSellAmount > 0 ? totalSellValue / totalSellAmount : 0;
      const priceChange =
        avgBuyPrice > 0 ? (avgSellPrice / avgBuyPrice - 1) * 100 : 0;

      // FIFO-based profit calculation
      const buyQueue = [];
      let realizedProfit = 0;

      trades.forEach((trade) => {
        if (trade.amount > 0) {
          // Buy transactions: add to buy queue
          buyQueue.push({
            amount: trade.amount,
            price: trade.price,
            date: trade.createdAt,
          });
        } else {
          // Sell transactions: FIFO processing
          let sellAmountRemaining = Math.abs(trade.amount);
          const sellPrice = trade.price;
          let profitFromThisSell = 0;

          while (sellAmountRemaining > 0 && buyQueue.length > 0) {
            const oldestBuy = buyQueue[0];

            if (oldestBuy.amount <= sellAmountRemaining) {
              // Fully consume oldest buy order
              const profit = oldestBuy.amount * (sellPrice - oldestBuy.price);
              profitFromThisSell += profit;
              sellAmountRemaining -= oldestBuy.amount;
              buyQueue.shift();
            } else {
              // Partially consume buy order
              const profit =
                sellAmountRemaining * (sellPrice - oldestBuy.price);
              profitFromThisSell += profit;
              oldestBuy.amount -= sellAmountRemaining;
              sellAmountRemaining = 0;
            }
          }

          realizedProfit += profitFromThisSell;
        }
      });

      // Current portfolio state check
      const fundData = await this.fundDataModel.findById(fundId).lean();
      const portfolioToken =
        fundData?.portfolio?.find((t) => t.symbol === tokenSymbol) || null;

      // Compare expected and actual holdings
      const expectedAmount = totalBuyAmount - totalSellAmount;
      const hasDiscrepancy =
        Math.abs(expectedAmount - (portfolioToken?.amount || 0)) > 0.0001;

      return {
        success: true,
        trades: trades.length,
        buyAmount: totalBuyAmount,
        buyValue: totalBuyValue,
        sellAmount: totalSellAmount,
        sellValue: totalSellValue,
        avgBuyPrice,
        avgSellPrice,
        priceChange,
        realizedProfit,
        portfolioState: portfolioToken || null,
        expectedAmount,
        hasDiscrepancy,
        tradeHistory: tradeHistory || [], // Always return array guarantee
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        trades: [], // Return empty array even on error
        tradeHistory: [], // Return empty array even on error
      };
    }
  }
}
