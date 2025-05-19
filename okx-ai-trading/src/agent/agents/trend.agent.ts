import { Injectable } from '@nestjs/common';
import { ScraperService } from '../services/scraper.service';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { gpt4oMini } from '../utils/model';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { AgentState } from '../utils/state';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TrendToken } from 'src/common/schemas/trend-token.schema';
import { RunnableConfig } from '@langchain/core/runnables';

@Injectable()
export class TrendAgent {
  constructor(
    @InjectModel('TrendToken')
    private trendTokenModel: Model<TrendToken>,
    private readonly scraperService: ScraperService,
  ) {}

  private trendTool = tool(
    async ({}) => {
      const scraper = this.scraperService.getScraper();

      const listTweetsResponse = await scraper.fetchListTweets(
        '1905567263509606578', // cavil777 Lists
        1000,
      );

      // 트윗 활동 기반 volume 점수 계산
      const calculateVolumeScore = (tweets) => {
        if (!tweets || tweets.length === 0) return 0;

        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // 최근 24시간 내 트윗만 필터링
        const recentTweets = tweets.filter(
          (tweet) => new Date(tweet.timeParsed) > oneDayAgo,
        );

        if (recentTweets.length === 0) return 0;

        // 평균 좋아요와 리트윗 수 계산
        const avgLikes =
          recentTweets.reduce((sum, tweet) => sum + (tweet.likes || 0), 0) /
          recentTweets.length;
        const avgRetweets =
          recentTweets.reduce((sum, tweet) => sum + (tweet.retweets || 0), 0) /
          recentTweets.length;

        // volume 점수 계산 (0-100)
        const engagementScore = (avgLikes * 0.6 + avgRetweets * 0.4) / 100; // 100회 기준으로 정규화
        const timeScore = recentTweets.length / 50; // 50개 트윗 기준으로 정규화

        const volumeScore = Math.min(
          100,
          Math.round((engagementScore * 0.7 + timeScore * 0.3) * 100),
        );

        return volumeScore;
      };

      const volumeScore = calculateVolumeScore(listTweetsResponse.tweets);

      // 트윗 데이터는 제외하고 분석 결과만 반환
      return JSON.stringify(
        {
          listCount: listTweetsResponse.tweets?.length || 0,
          volumeScore: volumeScore,
          analysisResults: {
            recentActivity: listTweetsResponse.tweets?.length || 0,
            engagementScore: volumeScore,
            trendingPeriod: '24h',
          },
        },
        null,
        2,
      );
    },
    {
      name: 'trendSearch',
      description: 'Search recent tweets for a keyword and analyze trends',
      schema: z.object({
        keyword: z.string().describe('The keyword to search for'),
      }),
    },
  );

  private trendAgent = createReactAgent({
    llm: gpt4oMini,
    tools: [this.trendTool],
    stateModifier: new SystemMessage({
      content: `Analyze cryptocurrency trends from tweets.

      Format your response as:
      {
        "keyword": "keyword",
        "trends": [
          {
            "symbol": "symbol",
            "sentiment": "positive/negative/neutral",
            "score": number (0-100),
            "volume": number (based on tweet activity),
            "trend": "up/down/stable",
            "summary": "brief analysis"
          }
        ],
        "overall_sentiment": "positive/negative/neutral",
        "trending_topics": ["topic1", "topic2", ...]
      }

      
      IMPORTANT: For BTC or Bitcoin symbol, always use this fixed address: "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh"

      Keep response concise and complete in one message.`,
    }),
  });

  public trendAgentNode = async (
    state: typeof AgentState.State,
    config?: RunnableConfig,
  ) => {
    try {
      const augmentedMessages = [
        ...state.messages,
        new HumanMessage({
          content: `Analyze trends for: ${state.query}`,
        }),
      ];

      const result = await this.trendAgent.invoke(
        {
          ...state,
          messages: augmentedMessages,
        },
        config,
      );

      const lastMessage = result.messages[result.messages.length - 1];
      const addresses: string[] = [];
      let updatedContent = lastMessage.content;

      try {
        const content =
          typeof lastMessage.content === 'string'
            ? lastMessage.content
            : JSON.stringify(lastMessage.content);

        // JSON 문자열 정리 (마지막 콤마 제거)
        const cleanedContent = content.replace(/,(\s*[}\]])/g, '$1');
        const jsonContent = cleanedContent
          .replace(/```json\n|\n```/g, '')
          .trim();

        try {
          const parsedContent = JSON.parse(jsonContent);

          // trends 배열이 있는 경우 처리
          if (parsedContent.trends && Array.isArray(parsedContent.trends)) {
            // 각 트렌드 항목에 대해 주소 조회
            for (const trend of parsedContent.trends) {
              if (trend.symbol) {
                const cleanSymbol = trend.symbol.replace('$', '');
                // sentiment가 positive인 경우에만 주소 조회
                if (trend.sentiment === 'positive') {
                  const trendToken = await this.trendTokenModel.findOne({
                    symbol: { $regex: cleanSymbol, $options: 'i' },
                  });

                  if (trendToken?.address) {
                    trend.address = trendToken.address;
                    addresses.push(trendToken.address);
                  }
                }
              }
            }
            // 주소가 추가된 내용으로 업데이트
            updatedContent = JSON.stringify(parsedContent, null, 2);
          }
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Content that failed to parse:', jsonContent);
          throw parseError;
        }
      } catch (e) {
        console.error('Failed to parse message content:', e);
      }

      return {
        messages: [
          new HumanMessage({
            content: updatedContent,
            name: 'trendAnalyst',
          }),
        ],
        address: addresses,
      };
    } catch (error) {
      console.error('Trend analysis error:', error);
      return {
        messages: [
          new HumanMessage({
            content: 'Analysis failed. Please try again.',
            name: 'trendAnalyst',
          }),
        ],
        address: [],
      };
    }
  };

  async getTrendAgent() {
    const result = await this.trendAgent.invoke({
      messages: [new HumanMessage({ content: 'trendSearch' })],
    });

    return result.messages[result.messages.length - 1].content;
  }
}
