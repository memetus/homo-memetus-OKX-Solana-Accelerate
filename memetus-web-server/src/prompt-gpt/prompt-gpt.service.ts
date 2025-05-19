import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CoinData } from 'src/common/schemas/coin-data.schema';
import { CoinPrice } from 'src/common/schemas/coin-price.schema';
import { FundData } from 'src/common/schemas/fund-data.schema';
import { GptStrategy } from 'src/common/schemas/gpt-strategies.schema';
import { Users } from 'src/common/schemas/users.schema';
import { zodResponseFormat } from 'openai/helpers/zod';
import { OpenAIEmbeddings } from '@langchain/openai';
import { TradingResult } from 'src/common/schemas/trading-result.schema';
import { z } from 'zod';
import OpenAI from 'openai';

@Injectable()
export class PromptGptService {
  private openai: OpenAI;
  private openaiEmbeddings: OpenAIEmbeddings;

  constructor(
    @InjectModel('Users')
    private usersModel: Model<Users>,
    @InjectModel('GptStrategy')
    private gptStrategyModel: Model<GptStrategy>,
    @InjectModel('CoinData')
    private coinDataModel: Model<CoinData>,
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

  async create(data: any, userId: string) {
    const newGptStrategy = await this.getCoinTradingStrategy(data.prompt);

    return newGptStrategy;
  }

  async getPromptNumber(userId: string) {
    const userInfo = await this.usersModel.findById(userId);

    if (!userInfo) {
      throw new BadRequestException('User not found');
    }

    const countPromptGpt = await this.gptStrategyModel.countDocuments({
      userWallet: userInfo.wallet,
    });

    const doublePromptGpt = await this.gptStrategyModel.countDocuments({
      userWallet: userInfo.wallet,
      prompt: { $ne: null },
    });

    return {
      userPromptNumber: countPromptGpt - doublePromptGpt,
    };
  }

  async setCount(userId: string) {
    const userInfo = await this.usersModel.findById(userId);

    const newGptStrategy = {
      userWallet: userInfo.wallet,
      prompt: null,
    };

    await this.gptStrategyModel.create(newGptStrategy);

    return 'success';
  }

  async getCoinTradingStrategy(prompt: string) {
    const query = prompt;

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

    // Generate a response based on the search results
    const response = await this.openai.chat.completions.create({
      model: 'ft:gpt-4o-2024-08-06:personal::Aizh1H1F',
      messages: [
        {
          role: 'system',
          content: `As a professional investment analyst, strictly evaluate tokens based on market cap, category criteria, and dynamic portfolio allocation.

          [PORTFOLIO MANAGEMENT]
          1. Fund Allocation

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
            - Risk Assessment Score (0-100)

          4. Asset Allocation
            - Token Positions (USD amounts)
            - Cash Reserve (USD amount)`,
        },
        {
          role: 'user',
          content: `Analyze based on:
          1. Market Cap: ${query}
          2. Category: ${query}
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

          Additionally, identify and recommend new tokens for investment based on the highest expected returns from the data set. Provide a detailed analysis and justification for each new token recommendation.`,
        },
      ],
      response_format: zodResponseFormat(CoinsResponseSchema, 'coins'),
    });

    return response.choices[0].message.content;
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
      k: 3,
      searchType: 'mmr',
      // verbose: true,
      searchKwargs: {
        fetchK: 50, // 검색할 후보 문서 수
        lambda: 0.8, // 다양성과 관련성 사이의 균형
      },
    });
    // query로 검색 수행
    const results = await retriever.invoke(query);

    return results;
  }
}
