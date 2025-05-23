import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FundData } from 'src/common/schemas/fund-data.schema';
import { TradingResult } from 'src/common/schemas/trading-result.schema';
import { SendaiService } from './service/sendai.service';
import { AgentService } from 'src/agent/agent.service';
import { CoinPrice } from 'src/common/schemas/coin-price.schema';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RealTradingService {
  constructor(
    @InjectModel('TradingResult')
    private tradingResultModel: Model<TradingResult>,

    @InjectModel('FundData')
    private fundDataModel: Model<FundData>,

    @InjectModel('CoinPrice')
    private coinPriceModel: Model<CoinPrice>,

    private readonly sendaiService: SendaiService,
    private readonly agentService: AgentService,
    private readonly configService: ConfigService,
  ) {}

  @Cron('0 * * * *')
  async handleRealTrading() {
    await this.fundRealTrading();
  }

  async fundRealTrading() {
    const fundDataList = await this.fundDataModel
      .find({
        survived: true,
        realTrading: true,
      })
      .lean();

    for (const fundData of fundDataList) {
      try {
        const recommend = await this.agentService.getRecommendation(
          fundData._id.toString(),
        );

        console.log(recommend);

        const balance = await this.sendaiService.getBalance();
        const totalTokenNav = fundData.portfolio.reduce((total, position) => {
          return total + position.nav;
        }, 0);

        const totalFund = balance.balance + totalTokenNav;

        // 각 코인에 대한 거래 실행
        for (const coin of recommend.coins) {
          const coinPriceInfo = await this.coinPriceModel.findOne({
            address: coin.address,
          });

          if (coin.recommendation === 'buy') {
            try {
              const currentPosition = fundData.portfolio.find(
                (p) => p.address === coin.address,
              );

              const currentAllocation = currentPosition
                ? currentPosition.allocation
                : 0;

              const allocationDifference = coin.allocation - currentAllocation;
              const buyAmount = (
                (totalFund * allocationDifference) /
                100
              ).toFixed(3);

              // buyAmount가 0보다 클 때만 거래 실행
              if (parseFloat(buyAmount) <= 0) {
                continue;
              }

              const swap = await this.sendaiService.executeSwap({
                amount: buyAmount,
                fromTokenAddress: '11111111111111111111111111111111',
                toTokenAddress: coin.address,
                slippage: '1',
              });

              // Retry up to 10 times with 5 second intervals
              let txResult;
              for (let i = 0; i < 10; i++) {
                try {
                  await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
                  txResult = await this.sendaiService.parseTransaction(
                    swap.signature,
                  );
                  break; // Exit loop if successful
                } catch (parseError) {
                  if (i === 9) {
                    // Failed after all attempts
                    throw new Error(
                      `Transaction parsing failed after 10 attempts: ${swap.signature}`,
                    );
                  }
                }
              }

              await this.tradingResultModel.create({
                fundId: fundData._id,
                name: coin.name,
                symbol: coin.symbol,
                address: coin.address,
                price: coinPriceInfo.priceUSD,
                amount: txResult.outputAmount,
                analysis: coin.analysis,
                recommendation: coin.recommendation,
                allocation: coin.allocation,
                tradingAmount: txResult.inputAmount,
                txHash: swap.transactionId,
              });

              // Prepare data for portfolio update
              const portfolioUpdates = new Map();
              portfolioUpdates.set(coin.address, {
                amount: txResult.outputAmount,
                allocation: coin.allocation,
                tradingAmount: txResult.inputAmount,
              });

              // Update FundData
              const existingPosition = fundData.portfolio.find(
                (p) => p.address === coin.address,
              );

              const updateQuery = existingPosition
                ? {
                    // Update existing position
                    $set: {
                      'portfolio.$[elem].amount': txResult.outputAmount,
                      'portfolio.$[elem].allocation': coin.allocation,
                      'portfolio.$[elem].tradingAmount': txResult.inputAmount,
                    },
                  }
                : {
                    // Add new position
                    $push: {
                      portfolio: {
                        symbol: coin.symbol,
                        address: coin.address,
                        amount: txResult.outputAmount,
                        allocation: coin.allocation,
                        tradingAmount: txResult.inputAmount,
                        totalPnL: 0,
                        realizedProfit: 0,
                        unrealizedProfit: 0,
                        nav: 0,
                      },
                    },
                  };

              const updateOptions = existingPosition
                ? {
                    arrayFilters: [{ 'elem.address': coin.address }],
                    new: true,
                  }
                : { new: true };

              await this.fundDataModel.findByIdAndUpdate(
                fundData._id,
                updateQuery,
                updateOptions,
              );
            } catch (error) {
              console.error('Error in buy trading:', error);
            }
          } else if (coin.recommendation === 'sell') {
            try {
              const currentPosition = fundData.portfolio.find(
                (p) => p.address === coin.address,
              );

              if (!currentPosition) {
                continue;
              }

              const allocationDifference =
                coin.allocation - currentPosition.allocation;

              // 현재 allocation 대비 변화 비율 계산
              const changeRatio =
                Math.abs(allocationDifference) / currentPosition.allocation;

              // 현재 보유량에서 비율만큼 계산 (소수점 3자리 반올림)
              const tokenAmountToSell = Number(
                (currentPosition.amount * changeRatio).toFixed(3),
              );

              // 판매 수량이 0보다 클 때만 거래 실행
              if (tokenAmountToSell <= 0) {
                continue;
              }

              const sellAmount = (
                (totalFund * allocationDifference) /
                100
              ).toFixed(3);

              const swap = await this.sendaiService.executeSwap({
                amount: sellAmount,
                fromTokenAddress: coin.address,
                toTokenAddress: '11111111111111111111111111111111',
                slippage: '1',
              });

              // Retry up to 10 times with 5 second intervals
              let txResult;
              for (let i = 0; i < 10; i++) {
                try {
                  await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
                  txResult = await this.sendaiService.parseTransaction(
                    swap.signature,
                  );
                  break; // Exit loop if successful
                } catch (parseError) {
                  if (i === 9) {
                    // Failed after all attempts
                    throw new Error(
                      `Transaction parsing failed after 10 attempts: ${swap.signature}`,
                    );
                  }
                }
              }

              await this.tradingResultModel.create({
                fundId: fundData._id,
                name: coin.name,
                symbol: coin.symbol,
                address: coin.address,
                price: coinPriceInfo.priceUSD,
                amount: txResult.outputAmount,
                analysis: coin.analysis,
                recommendation: coin.recommendation,
                allocation: coin.allocation,
                tradingAmount: txResult.inputAmount,
                txHash: swap.transactionId,
              });

              // Prepare data for portfolio update
              const portfolioUpdates = new Map();
              portfolioUpdates.set(coin.address, {
                amount: txResult.outputAmount,
                allocation: coin.allocation,
                tradingAmount: txResult.inputAmount,
              });

              // Update FundData
              const existingPosition = fundData.portfolio.find(
                (p) => p.address === coin.address,
              );

              const updateQuery = existingPosition
                ? {
                    // Update existing position
                    $set: {
                      'portfolio.$[elem].amount': txResult.outputAmount,
                      'portfolio.$[elem].allocation': coin.allocation,
                      'portfolio.$[elem].tradingAmount': txResult.inputAmount,
                    },
                  }
                : {
                    // Add new position
                    $push: {
                      portfolio: {
                        symbol: coin.symbol,
                        address: coin.address,
                        amount: txResult.outputAmount,
                        allocation: coin.allocation,
                        tradingAmount: txResult.inputAmount,
                        totalPnL: 0,
                        realizedProfit: 0,
                        unrealizedProfit: 0,
                        nav: 0,
                      },
                    },
                  };

              const updateOptions = existingPosition
                ? {
                    arrayFilters: [{ 'elem.address': coin.address }],
                    new: true,
                  }
                : { new: true };

              await this.fundDataModel.findByIdAndUpdate(
                fundData._id,
                updateQuery,
                updateOptions,
              );
            } catch (error) {
              console.error('Error in sell trading:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error in fundRealTrading:', error);
      }
    }
  }
}
