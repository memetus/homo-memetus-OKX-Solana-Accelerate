import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KolPool } from 'src/common/schemas/kol-pool.schema';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Scraper } from 'agent-twitter-client';
import { Keyword } from 'src/common/schemas/keyword.schema';
import { SearchMode } from 'agent-twitter-client';
import { cryptoExtractionPrompt } from './prompts/cryptoExtraction.prompt';
import { symbolPrompt } from './prompts/symbol.prompt';
import { TrendToken } from 'src/common/schemas/trend-token.schema';
import { categoryPrompt } from './prompts/category.prompt';
import { Cron } from '@nestjs/schedule';
import { EmbeddingService } from 'src/embedding/embedding.service';
import { CoinPrice } from 'src/common/schemas/coin-price.schema';

@Injectable()
export class KeywordService {
  private scraper: Scraper;

  constructor(
    @InjectModel('KolPool')
    private kolPoolModel: Model<KolPool>,

    @InjectModel('Keyword')
    private keywordModel: Model<Keyword>,

    @InjectModel('TrendToken')
    private trendTokenModel: Model<TrendToken>,

    @InjectModel('CoinPrice')
    private coinPriceModel: Model<CoinPrice>,

    private embeddingService: EmbeddingService,
    private readonly configService: ConfigService,
  ) {
    this.onModuleInit();
  }

  // @Cron('30 * * * *')
  async handleCronKolTrend() {
    console.log('Kol Trend is starting...');
    await this.getKeywordByKol();
    console.log('Kol Trend is completed...');
  }

  @Cron('50 * * * *')
  async handleCronTrendToken() {
    console.log('Categorizing trend token is starting...');
    await this.getCategoryByTwitter();
    console.log('Categorizing trend token is completed...');
  }

  @Cron('55 * * * *')
  async handleCronTwitterTrend() {
    console.log('Twitter Trend is starting...');
    await this.getListTweets();
    console.log('Twitter Trend is completed...');
  }

  async setNewKolPool(kolName: string, categories: string[]) {
    return await this.kolPoolModel.findOneAndUpdate(
      { name: kolName },
      { categories: categories },
      { upsert: true, new: true },
    );
  }

  async getProfileByKol() {
    try {
      const kolPoolInfo = await this.kolPoolModel.find();
      console.log(`Total KOLs to process: ${kolPoolInfo.length}`);

      const BATCH_SIZE = 5; // 한 번에 5개씩 처리
      const TIMEOUT = 20000; // 20초로 타임아웃 증가
      const results = [];

      // 배치 처리
      for (let i = 0; i < kolPoolInfo.length; i += BATCH_SIZE) {
        const batch = kolPoolInfo.slice(i, i + BATCH_SIZE);
        console.log(
          `Processing batch ${i / BATCH_SIZE + 1}, size: ${batch.length}`,
        );

        const batchResults = await Promise.allSettled(
          batch.map((kol) => {
            return new Promise(async (resolve) => {
              try {
                const profile = await Promise.race([
                  this.getProfile(kol.name),
                  new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), TIMEOUT),
                  ),
                ]);

                if (profile) {
                  resolve({ name: kol.name, status: 'success' });
                } else {
                  resolve({ name: kol.name, status: 'no_profile' });
                }
              } catch (error) {
                console.error(`Failed to process ${kol.name}:`, error.message);
                resolve({
                  name: kol.name,
                  status: 'error',
                  error: error.message,
                });
              }
            });
          }),
        );

        results.push(...batchResults);

        // 배치 사이에 잠시 대기
        if (i + BATCH_SIZE < kolPoolInfo.length) {
          console.log('Waiting between batches...');
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }

      // 결과 집계
      const summary = {
        total: results.length,
        success: 0,
        failed: 0,
        errors: [],
      };

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          if (result.value.status === 'success') {
            summary.success++;
          } else {
            summary.failed++;
            summary.errors.push({
              name: result.value.name,
              error: result.value.error || 'No profile found',
            });
          }
        }
      });

      await this.embeddingService.createdEmbeddingsKolPool();

      console.log('Processing summary:', summary);
      return summary;
    } catch (error) {
      console.error('Error in getProfileByKol:', error);
      throw error;
    }
  }

  async getProfile(kolName: string) {
    try {
      const userProfile = await this.scraper.getProfile(kolName);

      const biography = userProfile?.biography || '';

      const cashTags = (biography.match(/\$([A-Za-z0-9]+)/g) || []).map((tag) =>
        tag.substring(1),
      ); // '$' 제거

      const hashTags = (biography.match(/#([A-Za-z0-9_]+)/g) || []).map((tag) =>
        tag.substring(1),
      ); // '#' 제거

      const mentions = (biography.match(/@([A-Za-z0-9_]+)/g) || []).map(
        (mention) => mention.substring(1),
      ); // '@' 제거

      const urls = [];
      urls.push(userProfile.website);

      await this.kolPoolModel.findOneAndUpdate(
        { name: kolName },
        {
          uid: userProfile.userId,
          name: userProfile.username,
          description: userProfile.biography,
          joinedAt: userProfile.joined,
          public_metrics: {
            followers_count: userProfile.followersCount,
            following_count: userProfile.followingCount,
            tweet_count: userProfile.tweetsCount,
            listed_count: userProfile.listedCount,
          },
          kolKeywords: [...cashTags, ...hashTags, ...mentions],
          urls: urls,
        },
        { upsert: true, new: true },
      );

      console.log(`Profile data for ${kolName}`);
      return `updated kol info`;
    } catch (error) {
      console.error(`Error fetching profile for ${kolName}:`, error);
      return null;
    }
  }

  async getListTweets() {
    try {
      const listTweetsResponse = await this.scraper.fetchListTweets(
        '1905567263509606578', // cavil777 Lists
        1000,
      );

      console.log(listTweetsResponse.tweets.length);

      const keyword = await this.extractCryptoKeywords(
        listTweetsResponse.tweets,
      );

      interface KeywordData {
        symbols: string[];
        cryptoKeywords: string[];
        hashtags: string[];
        mentions: string[];
      }

      const keywordData = JSON.parse(keyword as string) as KeywordData;

      const savedKeyword = await this.keywordModel.create({
        symbols: keywordData.symbols,
        cryptoKeywords: keywordData.cryptoKeywords,
        hashtags: keywordData.hashtags,
        mentions: keywordData.mentions,
        createdAt: new Date(),
      });

      return savedKeyword;
    } catch (error) {
      console.error('Error processing tweets:', error);
      throw error;
    }
  }

  async getKeywordByKol() {
    try {
      const kolInfo = await this.kolPoolModel.find();
      console.log(`Total KOLs to process: ${kolInfo.length}`);

      const BATCH_SIZE = 3; // 한 번에 3개씩 처리
      const results = [];

      // 배치 처리
      for (let i = 0; i < kolInfo.length; i += BATCH_SIZE) {
        const batch = kolInfo.slice(i, i + BATCH_SIZE);
        console.log(
          `Processing batch ${i / BATCH_SIZE + 1}, size: ${batch.length}`,
        );

        const batchResults = await Promise.allSettled(
          batch.map((kol) => {
            return new Promise(async (resolve) => {
              try {
                await this.getTimelineByKol(kol.name);
                resolve({ name: kol.name, status: 'success' });
              } catch (error) {
                console.error(`Failed to process ${kol.name}:`, error.message);
                resolve({
                  name: kol.name,
                  status: 'error',
                  error: error.message,
                });
              }
            });
          }),
        );

        results.push(...batchResults);

        // 배치 사이에 5초 대기
        if (i + BATCH_SIZE < kolInfo.length) {
          console.log('Waiting between batches...');
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }

      // 결과 집계
      const summary = {
        total: results.length,
        success: 0,
        failed: 0,
        errors: [],
      };

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          if (result.value.status === 'success') {
            summary.success++;
          } else {
            summary.failed++;
            summary.errors.push({
              name: result.value.name,
              error: result.value.error,
            });
          }
        }
      });

      console.log('Processing summary:', summary);
      return summary;
    } catch (error) {
      console.error('Error in getKeywordByKol:', error);
      throw error;
    }
  }

  async getTimelineByKol(kolName: string) {
    try {
      const timeline = this.scraper.getTweets(kolName, 30);

      // timeline의 실제 데이터 확인
      const tweets = [];
      for await (const tweet of timeline) {
        // console.log('Tweet:', tweet); // 개별 트윗 데이터 확인
        tweets.push(tweet);
      }

      const keyword = await this.extractCryptoKeywords(tweets);

      interface KeywordData {
        symbols: string[];
        cryptoKeywords: string[];
        hashtags: string[];
        mentions: string[];
      }

      const keywordData = JSON.parse(keyword as string) as KeywordData;

      // console.log(keywordData);

      await this.kolPoolModel.findOneAndUpdate(
        { name: kolName },
        {
          symbols: keywordData.symbols,
          cryptoKeywords: keywordData.cryptoKeywords,
          hashtags: keywordData.hashtags,
          mentions: keywordData.mentions,
        },
        { upsert: true, new: true },
      );

      return keyword;
    } catch (error) {
      console.error(`Error fetching tweets for ${kolName}:`, error);
      throw error;
    }
  }

  private async extractCategory(
    symbol: string,
    description: string,
    tweets: any[],
  ) {
    const textData = tweets.map((post) => ({
      text: JSON.stringify(post.text),
    }));

    const model = new ChatOpenAI({
      apiKey: this.configService.get('ai-agent.openai'),
      model: 'gpt-4o-mini',
    });

    const systemMessage = {
      role: 'system',
      content: categoryPrompt(symbol, description, tweets),
    };

    const prompt = ChatPromptTemplate.fromMessages([
      new SystemMessage(systemMessage),
      new HumanMessage(JSON.stringify(textData)),
    ]);

    const response = await prompt
      .pipe(model)
      .invoke({ prompt: JSON.stringify(textData) });

    return response.content;
  }

  private async extractCryptoKeywords(tweets: any[]) {
    const textData = tweets.map((post) => ({
      text: JSON.stringify(post.text),
    }));

    const model = new ChatOpenAI({
      apiKey: this.configService.get('ai-agent.openai'),
      model: 'gpt-4o-mini',
    });

    const systemMessage = {
      role: 'system',
      content: cryptoExtractionPrompt(),
    };

    const prompt = ChatPromptTemplate.fromMessages([
      new SystemMessage(systemMessage),
      new HumanMessage(JSON.stringify(textData)),
    ]);

    const response = await prompt
      .pipe(model)
      .invoke({ prompt: JSON.stringify(textData) });

    return response.content;
  }

  private async extractSymbolChain(symbol: string, tweets: any[]) {
    const textData = JSON.stringify(tweets);

    // console.log(textData);

    const model = new ChatOpenAI({
      apiKey: this.configService.get('ai-agent.openai'),
      model: 'gpt-4o-mini',
    });

    const systemMessage = {
      role: 'system',
      content: symbolPrompt(symbol, tweets),
    };

    const prompt = ChatPromptTemplate.fromMessages([
      new SystemMessage(systemMessage),
      new HumanMessage(JSON.stringify(textData)),
    ]);

    const response = await prompt
      .pipe(model)
      .invoke({ prompt: JSON.stringify(textData) });

    return response.content;
  }

  async getCategoryByTwitter() {
    try {
      const batchSize = 5;
      const processedSymbols = new Set();

      const trendTokenInfo = await this.trendTokenModel
        .find({
          $or: [
            { categories: { $exists: false } },
            { categories: { $eq: [] } },
            { categories: null },
          ],
          symbol: { $nin: Array.from(processedSymbols) },
        })
        .limit(batchSize)
        .exec();

      if (!trendTokenInfo.length) {
        console.log('All token categories have been processed.');
        return 'completed';
      }

      for (const token of trendTokenInfo) {
        try {
          if (processedSymbols.has(token.symbol)) {
            continue;
          }

          const query = `${token.symbol} ${token.address}`;
          console.log(query);

          const results = await this.scraper.fetchSearchTweets(
            query,
            20,
            SearchMode.Top,
          );

          let categoryData;

          if (!results.tweets || results.tweets.length === 0) {
            categoryData = { categories: ['meme'] };
          } else {
            const category = await this.extractCategory(
              token.symbol,
              token.description,
              results.tweets,
            );
            categoryData = JSON.parse(category as string);

            if (
              !categoryData.categories ||
              categoryData.categories.length === 0
            ) {
              categoryData.categories = ['meme'];
            }
          }

          await this.trendTokenModel.updateMany(
            { symbol: token.symbol },
            { categories: categoryData.categories },
            { new: true },
          );

          await this.coinPriceModel.updateMany(
            { symbol: token.symbol },
            { category: categoryData.categories },
            { new: true },
          );

          processedSymbols.add(token.symbol);

          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          processedSymbols.add(token.symbol);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
      const nextBatch = await this.getCategoryByTwitter();
      return nextBatch;
    } catch (error) {
      throw error;
    }
  }

  private async onModuleInit() {
    try {
      this.scraper = new Scraper();

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // V2 기능을 위한 확장 로그인 (폴 기능 등 지원)
      await this.scraper.login(
        this.configService.get<string>('ai-agent.xUsername'),
        this.configService.get<string>('ai-agent.xPassword'),
        this.configService.get<string>('ai-agent.xEmail'),
        this.configService.get<string>('ai-agent.xApiKey'),
        this.configService.get<string>('ai-agent.xApiSecret'),
        this.configService.get<string>('ai-agent.xAccessToken'),
        this.configService.get<string>('ai-agent.xAccessTokenSecret'),
      );

      // const cookies = await this.scraper.getCookies();
      // console.log(cookies);

      // await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error) {
      console.error('Error initializing scraper:', error);

      // await this.retryLogin();
    }
  }

  private async retryLogin(retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        // await this.scraper.login(
        //   process.env.TWITTER_USERNAME as string,
        //   process.env.TWITTER_PASSWORD as string,
        // );

        await this.scraper.login(
          this.configService.get<string>('ai-agent.xUsername'),
          this.configService.get<string>('ai-agent.xPassword'),
          this.configService.get<string>('ai-agent.xEmail'),
          this.configService.get<string>('ai-agent.xApiKey'),
          this.configService.get<string>('ai-agent.xApiSecret'),
          this.configService.get<string>('ai-agent.xAccessToken'),
          this.configService.get<string>('ai-agent.xAccessTokenSecret'),
        );
        return;
      } catch (error) {
        console.error(`Login retry ${i + 1} failed:`, error);
      }
    }
  }
}
