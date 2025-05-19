import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { AgentService } from 'src/agent/agent.service';
import { CoinPrice } from 'src/common/schemas/coin-price.schema';
import { FundData } from 'src/common/schemas/fund-data.schema';
import { TradingResult } from 'src/common/schemas/trading-result.schema';

@Injectable()
export class TradingService {
  constructor(
    @InjectModel('TradingResult')
    private tradingResultModel: Model<TradingResult>,
    @InjectModel('FundData')
    private fundDataModel: Model<FundData>,
    @InjectModel('CoinPrice')
    private coinPriceModel: Model<CoinPrice>,

    private agentService: AgentService,
  ) {}

  @Cron('0 * * * *')
  async handleTrading() {
    try {
      const fundDataList = await this.fundDataModel
        .find({
          survived: true,
          realTrading: false,
        })
        .lean();

      const results = [];
      const failedFunds = [];
      const BATCH_SIZE = 7;
      const BATCH_TIMEOUT = 300000;
      const FUND_INTERVAL = 5000; // 5초 간격

      for (let i = 0; i < fundDataList.length; i += BATCH_SIZE) {
        const batch = fundDataList.slice(i, i + BATCH_SIZE);
        console.log(
          `Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(fundDataList.length / BATCH_SIZE)}`,
        );

        const batchPromises = batch.map((fundDataInfo, index) => {
          return new Promise((resolve) => {
            // 각 펀드의 시작 시간을 3초 간격으로 지연
            setTimeout(async () => {
              try {
                console.log(`Processing fund ${fundDataInfo.name}`);

                const result = await Promise.race([
                  this.getAgentTrading(fundDataInfo._id.toString()),
                  new Promise((_, reject) =>
                    setTimeout(
                      () => reject(new Error('Fund processing timeout')),
                      BATCH_TIMEOUT,
                    ),
                  ),
                ]);

                resolve({
                  fundId: fundDataInfo._id,
                  fundName: fundDataInfo.name,
                  success: true,
                  result,
                });
              } catch (error) {
                console.error(
                  `Fund ${fundDataInfo.name} processing error:`,
                  error,
                );

                failedFunds.push({
                  fundId: fundDataInfo._id.toString(),
                  fundName: fundDataInfo.name,
                  error: error.message,
                });

                resolve({
                  fundId: fundDataInfo._id,
                  fundName: fundDataInfo.name,
                  success: false,
                  error: error.message,
                });
              }
            }, index * FUND_INTERVAL); // index * 3초 지연
          });
        });

        try {
          const batchResults = await Promise.all(batchPromises);
          results.push(...batchResults);
        } catch (batchError) {
          console.error('Batch processing error:', batchError);
        }

        // 다음 배치 전에 2초 대기
        if (i + BATCH_SIZE < fundDataList.length) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      const summary = {
        total: results.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        failedFunds: failedFunds,
      };

      console.log('trading summary', summary);
      if (failedFunds.length > 0) {
        console.log('failedFunds', failedFunds);
      }

      return {
        message: `Trading process completed: ${summary.successful} successful, ${summary.failed} failed (Total ${summary.total} funds)`,
        summary,
        results,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAgentTrading(fundId: string) {
    const fundDataInfo = await this.fundDataModel.findById(fundId);

    if (!fundDataInfo) {
      console.log('fundDataInfo not found');
      return;
    }

    const analysis = await this.agentService.getRecommendation(fundDataInfo.id);

    console.log('analysis', analysis);

    let parsedAnalysis;
    try {
      parsedAnalysis =
        typeof analysis === 'string' ? JSON.parse(analysis) : analysis;
    } catch (error) {
      throw new Error('Failed to parse analysis data');
    }

    if (!parsedAnalysis || !Array.isArray(parsedAnalysis.coins)) {
      throw new Error('Invalid analysis data format');
    }

    const totalAllocation = parsedAnalysis.coins.reduce(
      (sum, coin) => sum + (coin.allocation || 0),
      0,
    );

    if (totalAllocation > 105 || totalAllocation < 95) {
      console.warn(
        `추천 할당량 합계가 100%와 차이가 큽니다: ${totalAllocation}%. 처리는 계속 진행합니다.`,
      );
    }

    const response = await this.setAgentTrading(fundId, parsedAnalysis);
    return response;
  }

  async setAgentTrading(fundId: string, agentAnalysis: any) {
    const fundDataInfo = await this.fundDataModel.findById(fundId).lean();
    if (!fundDataInfo) {
      throw new Error(`Fund with ID ${fundId} not found`);
    }

    const extractMarketDataFromAnalyst = () => {
      try {
        const messages = agentAnalysis.messages || [];
        const marketAnalysis = messages.find(
          (msg: any) =>
            msg &&
            msg.name === 'CoinMarketAnalyst' &&
            typeof msg.content === 'string',
        );

        if (!marketAnalysis) return {};

        const content = marketAnalysis.content;

        const coins: Record<string, any> = {};

        const coinRegex =
          /\*\*([\w\s]+)\s*\(([^)]+)\)\*\*\s*[\s\S]*?Price\*\*:\s*\$([0-9.]+)/g;
        let match;

        while ((match = coinRegex.exec(content)) !== null) {
          const symbol = match[2].trim();
          const price = parseFloat(match[3]);

          const addressMatch = new RegExp(
            `${symbol}[^\\S\\r\\n]*:[^\\S\\r\\n]*\`([^\\s\`]+)\``,
            'i',
          ).exec(content);
          const address = addressMatch ? addressMatch[1] : null;

          if (symbol && !isNaN(price)) {
            coins[symbol.toUpperCase()] = {
              symbol: symbol,
              price: price,
              address: address,
            };

            if (address) {
              coins[address] = {
                symbol: symbol,
                price: price,
                address: address,
              };
            }
          }
        }

        const simpleRegex =
          /\*\*([\w\s]+)\*\*[\s\S]*?Price\*\*:\s*\$([0-9.]+)/g;
        while ((match = simpleRegex.exec(content)) !== null) {
          const symbol = match[1].trim();
          const price = parseFloat(match[2]);

          const addressMatch = new RegExp(
            `${symbol}[^\\S\\r\\n]*:[^\\S\\r\\n]*\`([^\\s\`]+)\``,
            'i',
          ).exec(content);
          const address = addressMatch ? addressMatch[1] : null;

          if (symbol && !isNaN(price) && !coins[symbol.toUpperCase()]) {
            coins[symbol.toUpperCase()] = {
              symbol: symbol,
              price: price,
              address: address,
            };

            if (address) {
              coins[address] = {
                symbol: symbol,
                price: price,
                address: address,
              };
            }
          }
        }

        return coins;
      } catch (error) {
        console.warn(`coinMarketAnalyst 데이터 파싱 오류: ${error.message}`);
        return {};
      }
    };

    const marketDataFromAnalyst = extractMarketDataFromAnalyst();

    const coinAddresses = agentAnalysis.coins
      .filter((coin) => coin.address)
      .map((coin) => coin.address)
      .filter((address) => address.length >= 32);

    const portfolioAddresses = (fundDataInfo.portfolio || []).map(
      (position) => position.address,
    );

    const allAddresses = [
      ...new Set([...coinAddresses, ...portfolioAddresses]),
    ];

    const coinPrices = await this.coinPriceModel
      .find({
        address: {
          $in: allAddresses,
        },
      })
      .lean();

    const foundAddresses = coinPrices.map((coin) => coin.address);
    const missingAddresses = allAddresses.filter(
      (addr) => !foundAddresses.includes(addr),
    );

    if (missingAddresses.length > 0) {
      console.warn(`DB에 없는 코인 주소: ${missingAddresses.join(', ')}`);
    }

    const priceMap = new Map(coinPrices.map((coin) => [coin.address, coin]));

    let portfolioMarketValue = 0;
    for (const position of fundDataInfo.portfolio || []) {
      const positionAddress = position.address;
      const price = priceMap.get(positionAddress);

      if (price && price.priceUSD) {
        const currentValue = position.amount * parseFloat(price.priceUSD);
        portfolioMarketValue += currentValue;

        position.nav = currentValue;
      } else if (
        marketDataFromAnalyst[positionAddress] &&
        marketDataFromAnalyst[positionAddress].price
      ) {
        const price = marketDataFromAnalyst[positionAddress].price;
        const currentValue = position.amount * price;
        portfolioMarketValue += currentValue;

        position.nav = currentValue;
      } else if (
        position.symbol &&
        marketDataFromAnalyst[position.symbol.toUpperCase()] &&
        marketDataFromAnalyst[position.symbol.toUpperCase()].price
      ) {
        const price =
          marketDataFromAnalyst[position.symbol.toUpperCase()].price;
        const currentValue = position.amount * price;
        portfolioMarketValue += currentValue;

        position.nav = currentValue;
      } else {
        portfolioMarketValue += position.tradingAmount || 0;
        console.warn(
          `코인 ${position.symbol} (${position.address})의 가격 정보를 DB와 분석에서 찾을 수 없어 원래 투자 금액 사용 (tradingAmount: ${position.tradingAmount})`,
        );

        position.nav = position.tradingAmount || 0;
      }
    }

    const totalFundMarketValue = fundDataInfo.balance + portfolioMarketValue;

    const validCoins = [];
    const unknownCoins = [];

    for (const coin of agentAnalysis.coins) {
      if (!coin.address) {
        console.warn(
          `주소 없는 코인 건너뜀: ${coin.name || coin.symbol || 'unknown'}`,
        );
        continue;
      }

      const coinAddress = coin.address;

      const priceInfo = priceMap.get(coinAddress);

      if (priceInfo && priceInfo.priceUSD) {
        validCoins.push({
          ...coin,
          address: coinAddress,
          priceInfo,
          priceAsNumber: parseFloat(priceInfo.priceUSD),
        });
      } else {
        console.warn(
          `코인 ${coin.name || ''}(${coin.symbol || ''}) 주소 ${coinAddress} - DB에 가격 정보 없음`,
        );

        const marketDataByAddress = marketDataFromAnalyst[coinAddress];
        const marketDataBySymbol = coin.symbol
          ? marketDataFromAnalyst[coin.symbol.toUpperCase()]
          : null;

        if (marketDataByAddress && marketDataByAddress.price) {
          validCoins.push({
            ...coin,
            address: coinAddress,
            priceAsNumber: marketDataByAddress.price,
            priceInfo: {
              address: coinAddress,
              priceUSD: String(marketDataByAddress.price),
              symbol: coin.symbol || marketDataByAddress.symbol || 'UNKNOWN',
            },
          });
        } else if (marketDataBySymbol && marketDataBySymbol.price) {
          validCoins.push({
            ...coin,
            address: coinAddress,
            priceAsNumber: marketDataBySymbol.price,
            priceInfo: {
              address: coinAddress,
              priceUSD: String(marketDataBySymbol.price),
              symbol: coin.symbol || 'UNKNOWN',
            },
          });
        } else {
          console.warn(
            `코인 ${coin.symbol || ''} (${coinAddress}): 가격 정보를 어디서도 찾을 수 없음`,
          );
          unknownCoins.push(coin);
        }
      }
    }

    console.log(`처리할 유효 코인: ${validCoins.length}개`);
    if (unknownCoins.length > 0) {
      console.warn(`가격 정보 없어 처리 불가한 코인: ${unknownCoins.length}개`);
    }

    const portfolioMap = new Map(
      (fundDataInfo.portfolio || []).map((position) => [
        position.address,
        position,
      ]),
    );

    const totalRecommendedAllocation = validCoins.reduce(
      (sum, coin) => sum + (coin.allocation || 0),
      0,
    );

    if (Math.abs(totalRecommendedAllocation - 100) > 5) {
      console.warn(
        `추천 할당량 합계(${totalRecommendedAllocation.toFixed(2)}%)가 100%와 차이가 큽니다. 처리는 계속 진행합니다.`,
      );
    }

    const tradingResults = [];

    let updatedBalance = fundDataInfo.balance;
    const portfolioUpdates = new Map();
    const newPositions = [];

    for (const coin of validCoins) {
      try {
        const currentPosition = portfolioMap.get(coin.address);

        if (coin.recommendation === 'sell' && currentPosition) {
          const currentAllocation = currentPosition.allocation || 0;

          if (coin.allocation === 0) {
            const currentMarketValue =
              currentPosition.amount * coin.priceAsNumber;
            console.log(
              `전량 매도: ${currentPosition.symbol}, 수량: ${currentPosition.amount.toFixed(4)}, 금액: ${currentMarketValue.toFixed(2)}`,
            );

            const tradingResult = {
              fundId,
              name: coin.name,
              symbol: coin.symbol,
              address: coin.address,
              price: coin.priceAsNumber,
              amount: -currentPosition.amount,
              analysis: coin.analysis,
              recommendation: coin.recommendation,
              allocation: 0,
              tradingAmount: currentMarketValue,
            };
            tradingResults.push(tradingResult);

            portfolioUpdates.set(coin.address, {
              amount: 0,
              allocation: 0,
              tradingAmount: 0,
            });

            updatedBalance += currentMarketValue;
          } else if (currentAllocation > coin.allocation) {
            const allocationDifference = currentAllocation - coin.allocation;
            const sellRatio = allocationDifference / currentAllocation;
            const sellAmount = currentPosition.amount * sellRatio;
            const sellValue = sellAmount * coin.priceAsNumber;

            console.log(
              `부분 매도: ${currentPosition.symbol}, 비율: ${(sellRatio * 100).toFixed(2)}%, 수량: ${sellAmount.toFixed(4)}, 금액: ${sellValue.toFixed(2)}`,
            );

            const tradingResult = {
              fundId,
              name: coin.name,
              symbol: coin.symbol,
              address: coin.address,
              price: coin.priceAsNumber,
              amount: -sellAmount,
              analysis: coin.analysis,
              recommendation: coin.recommendation,
              allocation: coin.allocation,
              tradingAmount: sellValue,
            };
            tradingResults.push(tradingResult);

            const newAmount = currentPosition.amount - sellAmount;
            const newTradingAmount =
              currentPosition.tradingAmount * (1 - sellRatio);

            portfolioUpdates.set(coin.address, {
              amount: newAmount,
              allocation: coin.allocation,
              tradingAmount: newTradingAmount,
            });

            updatedBalance += sellValue;
          }
        }
      } catch (error) {
        console.error(
          `코인 ${coin.symbol} 매도 처리 중 오류: ${error.message}`,
        );
      }
    }

    for (const coin of validCoins) {
      try {
        if (coin.recommendation === 'buy') {
          const currentPosition = portfolioMap.get(coin.address);
          const currentAllocation = currentPosition
            ? currentPosition.allocation
            : 0;

          if (coin.allocation > currentAllocation) {
            const allocationDifference = coin.allocation - currentAllocation;
            const targetBuyValue =
              (allocationDifference / 100) * totalFundMarketValue;

            if (updatedBalance >= targetBuyValue) {
              const buyAmount = targetBuyValue / coin.priceAsNumber;

              console.log(
                `매수: ${coin.symbol}, 할당량: ${currentAllocation}% → ${coin.allocation}%, 금액: ${targetBuyValue.toFixed(2)}, 수량: ${buyAmount.toFixed(4)}`,
              );

              const tradingResult = {
                fundId,
                name: coin.name,
                symbol: coin.symbol,
                address: coin.address,
                price: coin.priceAsNumber,
                amount: buyAmount,
                analysis: coin.analysis,
                recommendation: coin.recommendation,
                allocation: coin.allocation,
                tradingAmount: targetBuyValue,
              };
              tradingResults.push(tradingResult);

              if (currentPosition) {
                const updatedAmount =
                  (portfolioUpdates.get(coin.address)?.amount ||
                    currentPosition.amount) + buyAmount;
                const updatedTradingAmount =
                  (portfolioUpdates.get(coin.address)?.tradingAmount ||
                    currentPosition.tradingAmount) + targetBuyValue;

                portfolioUpdates.set(coin.address, {
                  amount: updatedAmount,
                  allocation: coin.allocation,
                  tradingAmount: updatedTradingAmount,
                });
              } else {
                newPositions.push({
                  symbol: coin.symbol,
                  address: coin.address,
                  amount: buyAmount,
                  allocation: coin.allocation,
                  tradingAmount: targetBuyValue,
                  totalPnL: 0,
                  realizedProfit: 0,
                  unrealizedProfit: 0,
                  nav: targetBuyValue,
                });
              }

              updatedBalance -= targetBuyValue;
            } else {
              console.warn(
                `매수 불가: ${coin.symbol}, 필요 금액: ${targetBuyValue.toFixed(2)}, 잔액: ${updatedBalance.toFixed(2)}, 부족: ${(targetBuyValue - updatedBalance).toFixed(2)}`,
              );
            }
          }
        }
      } catch (error) {
        console.error(
          `코인 ${coin.symbol || 'unknown'} 매수 처리 중 오류: ${error.message}`,
        );
      }
    }

    const updatedPortfolio = [...(fundDataInfo.portfolio || [])];

    for (const [address, updates] of portfolioUpdates.entries()) {
      const index = updatedPortfolio.findIndex((p) => p.address === address);
      if (index >= 0) {
        updatedPortfolio[index] = {
          ...updatedPortfolio[index],
          ...updates,
        };
      }
    }

    updatedPortfolio.push(...newPositions);

    const filteredPortfolio = updatedPortfolio.filter(
      (position) => position.amount > 0,
    );

    // decisionMaker의 할당을 우선적으로 적용
    for (const coin of validCoins) {
      const position = filteredPortfolio.find(
        (p) => p.address === coin.address,
      );
      if (position) {
        position.allocation = coin.allocation;
      }
    }

    const totalAllocation = filteredPortfolio.reduce(
      (sum, position) => sum + (position.allocation || 0),
      0,
    );

    // 할당량 조정 로직 제거 - decisionMaker의 할당량을 그대로 유지
    if (Math.abs(totalAllocation - 100) > 0.1) {
      console.warn(
        `포트폴리오 할당량 합계(${totalAllocation.toFixed(2)}%)가 100%와 다릅니다. decisionMaker의 할당량을 유지합니다.`,
      );
    }

    const session = await this.fundDataModel.db.startSession();
    session.startTransaction();

    try {
      if (tradingResults.length > 0) {
        await this.tradingResultModel.insertMany(tradingResults, { session });
        console.log(`${tradingResults.length}개 거래 결과 저장 완료`);
      } else {
        console.log('실행된 거래 없음');
      }

      if (
        filteredPortfolio.length > 0 ||
        updatedBalance !== fundDataInfo.balance
      ) {
        const updateData = {
          balance: updatedBalance,
          portfolio: filteredPortfolio,
        };

        await this.fundDataModel.findByIdAndUpdate(
          fundId,
          { $set: updateData },
          { session },
        );

        console.log(
          `펀드 업데이트 완료 - 새 잔액: ${updatedBalance.toFixed(2)}, 포트폴리오 항목: ${filteredPortfolio.length}개`,
        );
      }

      await session.commitTransaction();
      console.log('모든 거래 DB 업데이트 완료');
    } catch (error) {
      await session.abortTransaction();
      console.error(`거래 처리 중 DB 오류: ${error.message}`);
      throw new Error(`거래 처리 실패: ${error.message}`);
    } finally {
      session.endSession();
    }

    return {
      success: true,
      tradesExecuted: tradingResults.length,
      updatedBalance,
      updatedPortfolioSize: filteredPortfolio.length,
      agentAnalysis,
    };
  }

  async getTotalRealizedProfit(fundId: string): Promise<number> {
    const fundData = await this.fundDataModel.findById(fundId).lean();
    if (!fundData) {
      return 0;
    }

    const allTrades = await this.tradingResultModel
      .find({ fundId })
      .sort({ createdAt: 1 })
      .lean();

    const tokenTrades = new Map();

    let totalRealizedProfit = 0;

    allTrades.forEach((trade) => {
      const address = trade.address.toLowerCase();

      if (!tokenTrades.has(address)) {
        tokenTrades.set(address, {
          address,
          symbol: trade.symbol || 'Unknown',
          buyQueue: [],
          totalBuyValue: 0,
          totalSellValue: 0,
          realizedProfit: 0,
          initialInvestment: trade.tradingAmount || 0,
        });
      }

      const tokenData = tokenTrades.get(address);

      if (trade.amount > 0) {
        tokenData.buyQueue.push({
          amount: trade.amount,
          price: trade.price,
          date: new Date(trade.createdAt || Date.now()),
          tradingAmount: trade.tradingAmount || trade.amount * trade.price,
        });
        tokenData.totalBuyValue += trade.amount * trade.price;

        if (trade.tradingAmount) {
          tokenData.initialInvestment += trade.tradingAmount;
        }
      } else {
        let sellAmountRemaining = Math.abs(trade.amount);
        const sellPrice = trade.price;
        tokenData.totalSellValue += sellAmountRemaining * sellPrice;

        let profitFromThisSell = 0;

        while (sellAmountRemaining > 0 && tokenData.buyQueue.length > 0) {
          const oldestBuy = tokenData.buyQueue[0];

          if (oldestBuy.amount <= sellAmountRemaining) {
            const profit = oldestBuy.amount * (sellPrice - oldestBuy.price);
            profitFromThisSell += profit;
            sellAmountRemaining -= oldestBuy.amount;
            tokenData.buyQueue.shift();
          } else {
            const profit = sellAmountRemaining * (sellPrice - oldestBuy.price);
            profitFromThisSell += profit;
            oldestBuy.amount -= sellAmountRemaining;
            sellAmountRemaining = 0;
          }
        }

        tokenData.realizedProfit += profitFromThisSell;
      }
    });

    const currentPortfolio = fundData.portfolio || [];
    const currentTokenAddresses = new Set(
      currentPortfolio.map((token) => token.address.toLowerCase()),
    );

    tokenTrades.forEach((tokenData) => {
      const isFullyLiquidated =
        tokenData.buyQueue.length === 0 ||
        !currentTokenAddresses.has(tokenData.address.toLowerCase());

      if (isFullyLiquidated && tokenData.initialInvestment > 0) {
        const maxPossibleLoss = -tokenData.initialInvestment;

        if (tokenData.realizedProfit < maxPossibleLoss) {
          tokenData.realizedProfit = maxPossibleLoss;
        }
      }

      if (
        tokenData.initialInvestment > 0 &&
        tokenData.realizedProfit < -tokenData.initialInvestment
      ) {
        tokenData.realizedProfit = -tokenData.initialInvestment;
      }

      totalRealizedProfit += tokenData.realizedProfit;
    });

    return totalRealizedProfit;
  }
}
