import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { Model } from 'mongoose';
import { CONSTANTS } from 'src/common/config/constants';
import { CoinData } from 'src/common/schemas/coin-data.schema';
import { FundData } from 'src/common/schemas/fund-data.schema';
import { TrendToken } from 'src/common/schemas/trend-token.schema';
import { EmbeddingService } from 'src/embedding/embedding.service';

@Injectable()
export class TokenPoolService {
  constructor(
    @InjectModel('CoinData')
    private coinDataModel: Model<CoinData>,

    @InjectModel('TrendToken')
    private trendTokenModel: Model<TrendToken>,

    @InjectModel('FundData')
    private fundDataModel: Model<FundData>,

    private embeddingService: EmbeddingService,
    private configService: ConfigService,
  ) {}

  @Cron('45 * * * *')
  async handleCronTrendToken() {
    console.log('TrendToken is starting...');
    await this.getTrendingTokens();
    console.log('TrendToken is completed...');
  }

  async getTrendingTokens() {
    const fundPortfolioTokens = await this.fundDataModel.find(
      {},
      { 'portfolio.address': 1 },
    );

    const portfolioAddresses = fundPortfolioTokens
      .reduce((addresses, fund) => {
        if (fund.portfolio && Array.isArray(fund.portfolio)) {
          const fundAddresses = fund.portfolio.map((token) =>
            token.address.toLowerCase(),
          );
          return [...addresses, ...fundAddresses];
        }
        return addresses;
      }, [] as string[])
      .filter(Boolean);

    const uniquePortfolioAddresses = [...new Set(portfolioAddresses)];

    const totalTokens = await this.trendTokenModel.countDocuments({
      address: { $nin: uniquePortfolioAddresses },
    });

    if (totalTokens > CONSTANTS.totalTrendingTokens) {
      // txnCount24 기준으로 정렬하여 하위 토큰들 삭제
      const tokensToRemove = await this.trendTokenModel
        .find({ address: { $nin: portfolioAddresses } })
        .sort({ txnCount24: 1 })
        .limit(totalTokens - CONSTANTS.totalTrendingTokens);

      const addressesToRemove = tokensToRemove.map((token) => token.address);

      // 삭제 전 토큰 수
      const beforeCount = await this.trendTokenModel.countDocuments();

      // 삭제 실행
      await this.trendTokenModel.deleteMany({
        address: { $in: addressesToRemove },
      });

      // 삭제 후 토큰 수
      const afterCount = await this.trendTokenModel.countDocuments();

      console.log(
        `Token count - Before: ${beforeCount}, After: ${afterCount}, Removed: ${beforeCount - afterCount}`,
      );
    }

    const url = CONSTANTS.codexUrl;
    const limit = CONSTANTS.getTrendingTokensLimit; // maximum number of results per page of codex

    const query = {
      query: `
        {
          filterTokens(
            filters: {
                network: [1399811149],
                potentialScam: false,
                marketCap: {
                  gte: 300000   
                },
                liquidity: {
                  gte: 50000    
                },
                txnCount24: {
                  gte: 10        
                }
            },
            rankings: [
              {attribute: trendingScore1, direction: DESC},
            ],
            limit: ${limit}
          ) {
            count
            page
            results {
              isScam
              marketCap
              txnCount24
              createdAt
              token {
                address
                name
                symbol
                creatorAddress 
                createdAt
                info {
                  description
                }
                exchanges {
                  name
                  id
                }
                socialLinks {
                  discord 
                  github 
                  instagram 
                  linkedin 
                  reddit 
                  telegram 
                  twitter 
                  website   
                  whitepaper 
                  youtube 
                }
              }
            }
          }
        }
      `,
    };

    const response = await axios.post(url, query, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.configService.get<string>('ai-agent.codexService'),
      },
    });

    // console.log('response:', JSON.stringify(response.data, null, 2));

    if (response.data.data.filterTokens?.results) {
      const { results } = response.data.data.filterTokens;

      const transformedResults = results
        .filter((result) => result.token.socialLinks?.twitter)
        .map((result) => ({
          address: result.token.address,
          name: result.token.name,
          symbol: result.token.symbol,
          creatorAddress: result.token.creatorAddress,
          description: result.token.info.description,
          exchanges: result.token.exchanges || [],
          socialLinks: result.token.socialLinks,
          createdAt: new Date(result.token.createdAt * 1000),
          marketCap: result.marketCap,
          txnCount24: result.txnCount24,
        }));

      if (transformedResults.length > 0) {
        const bulkOps = transformedResults.map((item) => ({
          updateOne: {
            filter: { address: item.address },
            update: { $set: item },
            upsert: true,
          },
        }));

        await this.trendTokenModel.bulkWrite(bulkOps);
        console.log(
          `Updated ${transformedResults.length} tokens with Twitter links`,
        );
      }

      // await this.embeddingService.createEmbeddingsTrendToken();
      return `Updated ${transformedResults.length} tokens with Twitter links`;
    }

    // console.log('totalData:', JSON.stringify(totalData, null, 2));

    return [];
  }
}
