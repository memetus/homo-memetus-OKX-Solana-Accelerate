import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CoinPrice } from 'src/common/schemas/coin-price.schema';
import { FundData } from 'src/common/schemas/fund-data.schema';
import { TradingResult } from 'src/common/schemas/trading-result.schema';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';

@Injectable()
export class DevService {
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
    this.openaiEmbeddings = new OpenAIEmbeddings({
      model: 'text-embedding-3-small',
      batchSize: 2048,
      stripNewLines: true,
    });
  }

  async createCoinPriceEmbeddings() {
    // Market Cap 범위 토큰화 함수
    const getMarketCapToken = (marketCap: number): string => {
      if (marketCap < 1000000) return 'small';
      if (marketCap < 5000000) return 'middle';
      return 'large';
    };

    const documents = await this.coinPriceModel.find().lean();
    const collection = this.coinPriceModel.collection;

    documents.map(async (doc) => {
      const { embedding, ...docWithoutEmbedding } = doc;
      // const { embedding, category } = doc;

      // const docWithoutEmbedding = { category };
      // 순서 보존을 위한 토큰 추가
      const marketCapValue = parseFloat(doc.marketCap);
      const marketCapToken = getMarketCapToken(marketCapValue);
      const enrichedDoc = {
        ...docWithoutEmbedding,
        market_cap_token: marketCapToken,
      };

      const pageContent = JSON.stringify(enrichedDoc);

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
            similarity: 'cosine',
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

  async langChainVectorSearch(query: string) {
    const collection = this.coinPriceModel.collection;
    const vectorStore = new MongoDBAtlasVectorSearch(this.openaiEmbeddings, {
      collection: collection,
      indexName: 'vector_index',
      textKey: 'pageContent',
      embeddingKey: 'embedding',
    });

    const retriever = vectorStore.asRetriever({
      k: 5,
      searchType: 'mmr',
      verbose: true,
      searchKwargs: {
        fetchK: 1000, // 검색할 후보 문서 수
        lambda: 0.8, // 다양성과 관련성 사이의 균형
      },
    });

    // query로 검색 수행
    const results = await retriever.invoke(query);

    return 'test';
  }

  async vectorSearchQuery(query: string) {
    const queryEmbedding = await this.openaiEmbeddings.embedDocuments([query]);

    const collection = this.coinPriceModel.collection;

    const documentCount = await collection.countDocuments();

    const pipeline = [
      {
        $vectorSearch: {
          index: 'vector_index',
          queryVector: queryEmbedding[0],
          path: 'embedding',
          textKey: 'pageContent',
          numCandidates: documentCount,
          limit: 10,
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
          score: { $gte: 0.62 },
        },
      },
    ];

    const result = collection.aggregate(pipeline);
    const resultsArray = [];
    for await (const doc of result) {
      resultsArray.push(doc);
    }
    console.log(JSON.stringify(resultsArray, null, 2));

    return 'test';
  }
}
