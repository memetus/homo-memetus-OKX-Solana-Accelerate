import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CoinData } from 'src/common/schemas/coin-data.schema';
import { CoinPrice } from 'src/common/schemas/coin-price.schema';
import { z } from 'zod';
import { OpenAIEmbeddings } from '@langchain/openai';
import { TrendToken } from 'src/common/schemas/trend-token.schema';
import { KolPool } from 'src/common/schemas/kol-pool.schema';

@Injectable()
export class EmbeddingService {
  private openaiEmbeddings: OpenAIEmbeddings;

  constructor(
    @InjectModel('CoinData')
    private coinDataModel: Model<CoinData>,
    @InjectModel('CoinPrice')
    private coinPriceModel: Model<CoinPrice>,
    @InjectModel('TrendToken')
    private trendTokenModel: Model<TrendToken>,
    @InjectModel('KolPool')
    private kolPoolModel: Model<KolPool>,

    private configService: ConfigService,
  ) {
    this.openaiEmbeddings = new OpenAIEmbeddings({
      model: 'text-embedding-3-small',
      batchSize: 2048,
      stripNewLines: true,
    });
  }

  async vectorSearchQuery(query: string, type: string) {
    // const queryEmbedding = await this.openaiEmbeddings(query);
    const queryEmbedding = query;
    const collection =
      type === 'coinPrice'
        ? this.coinPriceModel.collection
        : this.coinDataModel.collection;

    const documentCount = await collection.countDocuments();

    const pipeline = [
      {
        $vectorSearch: {
          index: 'vector_index',
          queryVector: queryEmbedding,
          path: 'embedding',
          numCandidates: documentCount,
          limit: 20,
        },
      },
      {
        $project: {
          _id: 0,
          doc: {
            $arrayToObject: {
              $filter: {
                input: { $objectToArray: '$$ROOT' },
                cond: { $ne: ['$$this.k', 'embedding'] },
              },
            },
          },
          score: { $meta: 'vectorSearchScore' },
        },
      },
      {
        $match: {
          score: { $gte: 0.72 }, // score가 0.7 이상인 결과만 응답
        },
      },
    ];

    const result = collection.aggregate(pipeline);
    const resultsArray = [];
    for await (const doc of result) {
      resultsArray.push(doc);
    }

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
    // const response = await this.openai.chat.completions.create({
    //   model: 'ft:gpt-4o-2024-08-06:personal::Aizh1H1F',
    //   // model: 'gpt-4o',
    //   messages: [
    //     {
    //       role: 'system',
    //       content: `You are a professional meme coin investor. Based on the following search results,
    //       provide an investment judgment for the coins that are suitable for investment.
    //       Include the name, symbol, your analysis (detailed and informative, including numerical data such as market cap, recent price changes, and trading volume),
    //       and a recommendation to buy, sell, or hold.
    //       Additionally, specify how much of the 100 SOL fund should be allocated to each coin.
    //       The user is specifically interested in coins that match the following criteria: ${query}.
    //       Ensure that the recommendations align with the specified market cap category.\n\n
    //       ${JSON.stringify(resultsArray, null, 2)}\n\n
    //       If there are no suitable tokens for recommendation,
    //       please respond with "No suitable tokens for recommendation".`,
    //     },
    //     {
    //       role: 'user',
    //       content: `Please consider the following criteria when making your judgment: ${query}\n\n
    //       If there are no suitable tokens for recommendation,
    //       please respond with "No suitable tokens for recommendation".
    //       Be strict in your evaluation.`,
    //     },
    //   ],
    //   response_format: zodResponseFormat(CoinsResponseSchema, 'coins'),
    // });

    // return response.choices[0].message.content;
    return 'test';
  }

  async createEmbeddingsCoinPrice() {
    const collection = this.coinPriceModel.collection;
    const documents = await this.coinPriceModel.find().lean();

    // Market Cap 범위 토큰화 함수
    const getMarketCapToken = (marketCap: number): string => {
      if (marketCap < 1000000) return 'small_cap';
      if (marketCap < 5000000) return 'mid_cap';
      return 'large_cap';
    };

    documents.map(async (doc) => {
      // const { embedding, ...docWithoutEmbedding } = doc;
      const {
        embedding,
        category,
        createdAt,
        priceUSD,
        high24,
        low24,
        volume24,
        volumeChange24,
        change24,
        change12,
        change5m,
        buyCount24,
        sellCount24,
        uniqueBuys24,
        uniqueSells24,
        marketCap,
        liquidity,
        holders,
      } = doc;

      const docWithoutEmbedding = {
        category,
        createdAt,
        priceUSD,
        high24,
        low24,
        volume24,
        volumeChange24,
        change24,
        change12,
        change5m,
        buyCount24,
        sellCount24,
        uniqueBuys24,
        uniqueSells24,
        marketCap,
        liquidity,
        holders,
      };
      // 순서 보존을 위한 토큰 추가
      const marketCapToken = getMarketCapToken(Number(doc.marketCap));
      const enrichedDoc = {
        ...docWithoutEmbedding,
        market_cap_token: marketCapToken,
      };

      const pageContent = JSON.stringify(enrichedDoc);
      // console.log(pageContent);

      const newEmbedding = await this.openaiEmbeddings.embedDocuments([
        pageContent, // 문자열로 전달
      ]);

      await collection.updateOne(
        { _id: doc._id },
        {
          $set: {
            embedding: newEmbedding[0],
            market_cap_token: marketCapToken,
            pageContent,
          },
        },
      );
    });

    const index = {
      name: 'vector_index',
      type: 'vectorSearch',
      definition: {
        fields: [
          {
            type: 'vector',
            numDimensions: 1536,
            path: 'embedding',
            similarity: 'dotProduct',
          },
        ],
      },
    };

    await this.dropAndCreateSearchIndex(collection, index);

    return 'Embeddings created successfully';
  }

  async createEmbeddingsTrendToken() {
    const collection = this.trendTokenModel.collection;
    const documents = await this.trendTokenModel.find().lean();

    // Market Cap 범위 토큰화 함수
    const getMarketCapToken = (marketCap: number): string => {
      if (marketCap < 1000000) return 'small_cap';
      if (marketCap < 5000000) return 'mid_cap';
      return 'large_cap';
    };

    documents.map(async (doc) => {
      // const { embedding, ...docWithoutEmbedding } = doc;
      const { embedding, categories } = doc;

      const docWithoutEmbedding = { categories };
      // 순서 보존을 위한 토큰 추가
      const marketCapToken = getMarketCapToken(Number(doc.marketCap));
      const enrichedDoc = {
        ...docWithoutEmbedding,
        market_cap_token: marketCapToken,
      };

      const pageContent = JSON.stringify(enrichedDoc);
      // console.log(pageContent);

      const newEmbedding = await this.openaiEmbeddings.embedDocuments([
        pageContent, // 문자열로 전달
      ]);

      await collection.updateOne(
        { _id: doc._id },
        {
          $set: {
            embedding: newEmbedding[0],
            market_cap_token: marketCapToken,
            pageContent,
          },
        },
      );
    });

    const index = {
      name: 'vector_index',
      type: 'vectorSearch',
      definition: {
        fields: [
          {
            type: 'vector',
            numDimensions: 1536,
            path: 'embedding',
            similarity: 'dotProduct',
          },
        ],
      },
    };

    await this.dropAndCreateSearchIndex(collection, index);

    return 'Embeddings created successfully';
  }

  async createdEmbeddingsKolPool() {
    const collection = this.kolPoolModel.collection;
    const documents = await this.kolPoolModel.find().lean();

    documents.map(async (doc) => {
      const { embedding, categories, name, kolKeywords, symbols } = doc;

      const docWithoutEmbedding = {
        categories,
        name,
        kolKeywords,
        symbols: symbols.map((s) => s.symbol),
      };
      // 순서 보존을 위한 토큰 추가
      const enrichedDoc = {
        ...docWithoutEmbedding,
      };

      const pageContent = JSON.stringify(enrichedDoc);
      // console.log(pageContent);

      const newEmbedding = await this.openaiEmbeddings.embedDocuments([
        pageContent, // 문자열로 전달
      ]);

      await collection.updateOne(
        { _id: doc._id },
        {
          $set: {
            embedding: newEmbedding[0],
            pageContent,
          },
        },
      );
    });

    const index = {
      name: 'vector_index',
      type: 'vectorSearch',
      definition: {
        fields: [
          {
            type: 'vector',
            numDimensions: 1536,
            path: 'embedding',
            similarity: 'dotProduct',
          },
        ],
      },
    };

    await this.dropAndCreateSearchIndex(collection, index);

    return 'Embeddings created successfully';
  }

  private async dropAndCreateSearchIndex(collection, index) {
    // 기존 인덱스가 존재하는지 확인하고 삭제
    const existingIndexes = await collection.listSearchIndexes().toArray();
    const indexExists = existingIndexes.some((idx) => idx.name === index.name);

    console.log(indexExists);

    if (indexExists) {
      await collection.dropSearchIndex(index.name);
    }

    await this.waitForIndexDeletion(collection, index.name);

    await collection.createSearchIndex(index);
  }

  private async waitForIndexDeletion(
    collection,
    indexName,
    interval = 5000,
    timeout = 1000000,
  ) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const existingIndexes = await collection.listSearchIndexes().toArray();
      const indexExists = existingIndexes.some((idx) => idx.name === indexName);

      if (!indexExists) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    throw new Error(
      `Index ${indexName} was not deleted within the timeout period.`,
    );
  }
}
