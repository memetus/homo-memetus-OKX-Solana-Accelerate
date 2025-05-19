import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CoinPrice } from 'src/common/schemas/coin-price.schema';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { FundData } from 'src/common/schemas/fund-data.schema';
import { TradingResult } from 'src/common/schemas/trading-result.schema';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { OpenAIEmbeddings } from '@langchain/openai';

@Injectable()
export class AnalysisService {
  private openai: OpenAI;
  private openaiEmbeddings: OpenAIEmbeddings;

  constructor(
    @InjectModel('CoinPrice')
    private coinPriceModel: Model<CoinPrice>,
    @InjectModel('FundData')
    private fundDataModel: Model<FundData>,
    @InjectModel('TradingResult')
    private tradingResultModel: Model<TradingResult>,

    private configService: ConfigService,
  ) {
    const openaiKey = this.configService.get<string>('ai-agent.openai');

    if (!openaiKey) {
      throw new Error(
        'The OPENAI_API_KEY environment variable is missing or empty',
      );
    }
    this.openai = new OpenAI({ apiKey: openaiKey });

    this.openaiEmbeddings = new OpenAIEmbeddings({
      model: 'text-embedding-3-small',
      batchSize: 2048,
      stripNewLines: true,
    });
  }

  async getCoinTradingStrategy(fundId: string) {
    const fundDataInfo = await this.fundDataModel.findById(fundId).lean();

    if (!fundDataInfo) {
      throw new BadRequestException('Fund not found');
    }

    const query = fundDataInfo.strategyPrompt;

    const fundBalance = fundDataInfo.balance;
    const fundPortfolio = fundDataInfo.portfolio;
    const portfolioMessage = JSON.stringify(fundPortfolio, null, 2);

    const portfolioPrice = await this.getPortfolio(fundId);
    const portfolioPriceData = JSON.stringify(portfolioPrice, null, 2);

    // console.log('portfolioPriceData', portfolioPriceData);

    const tradingResult = await this.getTradingResult(fundId);
    const tradingResultMessage = JSON.stringify(tradingResult, null, 2);

    // console.log('tradingResultMessage', tradingResultMessage);

    //RAG
    const result = await this.langChainVectorSearch(query);
    const resultsArray = [];
    for await (const doc of result) {
      resultsArray.push(doc);
    }

    const resultsArrayString = JSON.stringify(resultsArray, null, 2);
    // console.log('resultsArrayString', resultsArrayString);

    const CoinSchema = z.object({
      name: z.string(),
      symbol: z.string(),
      address: z.string(),
      analysis: z.string(),
      recommendation: z.enum(['buy', 'sell', 'hold']),
      allocation: z.number(),
    });

    const CoinsResponseSchema = z.object({
      coins: z.array(CoinSchema),
    });

    // 추천하기 적합한 토큰이 없을 경우
    if (resultsArray.length === 0) {
      return 'No suitable tokens for recommendation';
    }

    // console.log(JSON.stringify(resultsArray, null, 2));

    // Generate a response based on the search results
    const response = await this.openai.chat.completions.create({
      model: 'ft:gpt-4o-2024-08-06:personal::Aizh1H1F',
      messages: [
        {
          role: 'system',
          content: `As a professional investment analyst, strictly evaluate tokens based on market cap, category criteria, and dynamic portfolio allocation.
    
          [PORTFOLIO MANAGEMENT]
          1. Fund Allocation
            - Total Available: ${fundBalance} USD
            - Maximum Position Size: ${fundBalance * 0.3} USD
            - Minimum Cash Reserve: ${fundBalance * 0.1} USD
          
          [MANDATORY CRITERIA]
          1. Market Cap Requirements
            - Must exactly match specified market cap range
            - No deviation from category boundaries
          
          2. Category Alignment
            - Strict category matching
            - No cross-category recommendations
          
          3. Portfolio Allocation
            - Dynamic cash ratio based on market conditions
            - Risk-adjusted position sizing
            - Aggressive adjustments based on expected returns
          
          [CURRENT PORTFOLIO]
          ${portfolioMessage}
          
          [PORTFOLIO PRICE DATA]
          ${portfolioPriceData}
          
          Trading Results:
          ${tradingResultMessage}
          Analyze the profitability based on the trading history 
          and provide feedback to improve investment decisions. 
          Prioritize this analysis above all.

          Use the current_price from portfolioPriceData to analyze the profitability of previous trades in tradingResultMessage. 
          Provide feedback on the performance and make investment decisions based on this analysis.
    
          [DATA SET]
          ${resultsArrayString}
          Analyze the coins with the highest expected returns and make investment decisions based on this analysis.
          
          [RESPONSE FORMAT]
          1. Market Analysis
            - Quantitative Metrics
            - Risk Assessment
          
          2. Investment Recommendation
            - Buy/Sell/Hold Decision
            - Position Size Justification
          
          3. Portfolio Analysis
            - Fund Size: ${fundBalance} USD
            - Risk Assessment Score (0-100)
          
          4. Asset Allocation
            - Token Positions (USD amounts)
            - Cash Reserve (USD amount)
          
          * Position Sizing Rules:
            - Maximum per token: 30% of ${fundBalance}
            - Minimum position: 5% of ${fundBalance}
            - Cash Reserve: 5-30% based on risk
            - Total allocation and cash reserve must equal ${fundBalance} USD`,
        },
        {
          role: 'user',
          content: `Analyze based on:
          1. Market Cap: ${query}
          2. Category: ${query}
          3. Fund Balance: ${fundBalance}
          4. Market Conditions
          
          Calculate:
          - USD allocation per token
          - Risk-adjusted position sizes
          - Cash reserve amount
          
          Provide allocation with evidence.
          
          Compare current portfolio allocations with recommended allocations:
          1. For existing portfolio tokens:
            - Current allocation > Recommended allocation -> Set 'sell' with the lower allocation
            - Current allocation < Recommended allocation -> Set 'buy' with the higher allocation
            - Current allocation = Recommended allocation -> Set 'hold' with the same allocation
          
          2. For new tokens not in current portfolio:
            - Set 'buy' with the recommended allocation
          
          Examples of comparison:
          - Current: 30%, Recommended: 20% -> recommendation: 'sell', allocation: 20%
          - Current: 20%, Recommended: 30% -> recommendation: 'buy', allocation: 30%
          - Current: 20%, Recommended: 20% -> recommendation: 'hold', allocation: 20%
          - New token, Recommended: 25% -> recommendation: 'buy', allocation: 25%
          
          Ensure that:
          1. recommendation must be 'sell' if the recommended allocation is less than current
          2. All allocations must sum to ${fundBalance} USD including cash reserve
          3. Each allocation must be between 5% and 30% of ${fundBalance} USD
          4. Cash reserve must be between 5% and 30% of ${fundBalance} USD

          Additionally, identify and recommend new tokens for investment based on the highest expected returns from the data set. Provide a detailed analysis and justification for each new token recommendation.`,
        },
      ],
      response_format: zodResponseFormat(CoinsResponseSchema, 'coins'),
    });

    return response.choices[0].message.content;
  }

  private async getTradingResult(fundId: string) {
    const tradingResult = await this.tradingResultModel
      .find({
        fundId,
      })
      .limit(20)
      .sort({ createdAt: -1 });

    return tradingResult;
  }

  async langChainVectorSearch(query: string) {
    const collection = this.coinPriceModel.collection;
    const vectorStore = new MongoDBAtlasVectorSearch(this.openaiEmbeddings, {
      collection: collection,
      indexName: 'vector_index',
      textKey: 'pageContent',
      embeddingKey: 'embedding',
    });

    const retriever = vectorStore.asRetriever({
      k: 20,
      searchType: 'mmr',
      // verbose: true,
      searchKwargs: {
        fetchK: 1000, // 검색할 후보 문서 수
        lambda: 0.8, // 다양성과 관련성 사이의 균형
      },
    });

    // query로 검색 수행
    const results = await retriever.invoke(query);

    return results;
  }

  public async getPortfolio(fundId: string) {
    const fundDataInfo = await this.fundDataModel.findById(fundId).lean();

    if (!fundDataInfo) {
      throw new BadRequestException('Fund not found');
    }

    if (fundDataInfo.portfolio.length !== 0) {
      fundDataInfo.portfolio = await Promise.all(
        fundDataInfo.portfolio.map(async (coin) => {
          const coinPrice = await this.coinPriceModel
            .findOne({ address: coin.address }, { embedding: 0 })
            .lean();
          return { ...coin, coinPrice };
        }),
      );
    }

    return fundDataInfo.portfolio;
  }
}
