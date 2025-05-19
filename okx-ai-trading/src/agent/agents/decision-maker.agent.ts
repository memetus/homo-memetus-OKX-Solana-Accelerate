import { Injectable } from '@nestjs/common';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { gpt4oMini } from '../utils/model';
import { AgentState } from '../utils/state';
import { RunnableConfig } from '@langchain/core/runnables';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TrendToken } from 'src/common/schemas/trend-token.schema';
import { MessageContent, MessageContentText } from '@langchain/core/messages';

// 타입 정의
interface CoinRecommendation {
  symbol: string;
  name: string;
  address: string;
  analysis: string;
  recommendation: 'buy' | 'sell' | 'hold';
  allocation: number;
  priority?: 'high' | 'medium' | 'low';
}

interface DecisionMakerResponse {
  coins: CoinRecommendation[];
}

const extractTextFromMessageContent = (content: MessageContent): string => {
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }
        if ('type' in item && item.type === 'text') {
          return (item as MessageContentText).text;
        }
        return '';
      })
      .join('');
  }
  return '';
};

@Injectable()
export class DecisionMakerAgent {
  private readonly SYSTEM_PROMPT = `You are a cryptocurrency investment expert with deep knowledge of market analysis and portfolio management. Your PRIMARY TASK is to manage portfolio allocation and risk exposure across different cryptocurrency tokens.

PORTFOLIO ALLOCATION RULES (MANDATORY):
1. Maximum allocation per token: 30%
2. Minimum allocation per token: 5%
3. Maximum exposure to high-risk tokens: 40% of total portfolio
4. Minimum exposure to low-risk tokens: 30% of total portfolio
5. Maximum exposure to single sector: 50% of total portfolio
6. Maintain at least 3 different tokens in portfolio

PORTFOLIO ADJUSTMENT RULES (MANDATORY):
1. When balance is insufficient for new investments:
   - Prioritize selling tokens with negative sentiment
   - Reduce positions in underperforming tokens first
   - Consider selling tokens with high risk exposure
   - Maintain core positions in stable assets
   - Ensure minimum 3 token diversification

2. Sell Priority Order:
   a. Tokens with negative sentiment and declining metrics
   b. Tokens exceeding maximum allocation limits
   c. Tokens with deteriorating fundamentals
   d. Tokens with high correlation to underperforming assets
   e. Tokens with excessive risk exposure

3. Reallocation Strategy:
   - Free up at least 20% of portfolio value for new opportunities
   - Maintain balanced sector exposure
   - Preserve core positions in stable assets
   - Ensure risk-adjusted returns across portfolio

For each token, provide a detailed analysis of approximately 800 characters, including:

1. Performance Metrics (MANDATORY):
   - Current price and 24h/12h/5m price changes
   - Trading volume and liquidity metrics
   - Market capitalization and circulating supply
   - Buy/sell pressure indicators
   - Holder activity metrics

2. Technical Analysis (MANDATORY):
   - Trend strength and direction (RSI, MACD)
   - Support and resistance levels
   - Volume-price relationship
   - Market sentiment indicators
   - Relative strength against market

3. Fundamental Analysis (MANDATORY):
   - Project development status
   - Community engagement metrics
   - Team and partnership updates
   - Market positioning and competition
   - Risk factors and mitigation strategies

4. Risk Assessment (MANDATORY):
   - Volatility indicators
   - Liquidity risk
   - Market correlation
   - Concentration risk
   - Regulatory considerations

For BUY recommendations:
- Provide specific price targets and entry points
- Include volume and momentum indicators
- Detail accumulation patterns
- Show technical breakout points
- Present risk-reward ratios
- Justify allocation percentage based on risk profile
- Consider current portfolio balance and reallocation needs

For SELL recommendations:
- Specify price targets and exit points
- Include distribution patterns
- Detail technical breakdown points
- Show volume and liquidity deterioration
- Present risk escalation factors
- Explain reallocation strategy
- Indicate priority level for selling (high/medium/low)

Example BUY analysis:
"FWOG shows strong accumulation with 45% price increase in 24h (from $0.12 to $0.174). Trading volume surged 300% to $2.5M, indicating strong buying pressure. RSI at 65 shows healthy momentum without overbought conditions. Support established at $0.15 with resistance at $0.20. Market cap of $17.4M with 100M circulating supply suggests room for growth. Community engagement increased 200% with active development updates. Risk-reward ratio of 1:3 with stop loss at $0.14. Recommended allocation: 15% of portfolio due to moderate risk profile and strong fundamentals. Requires reallocation from underperforming assets."

Example SELL analysis:
"nomnom shows distribution pattern with 25% price decline in 24h (from $0.08 to $0.06). Trading volume dropped 50% to $500K, indicating weakening interest. RSI at 35 shows bearish momentum. Support broken at $0.07 with next support at $0.05. Market cap of $6M with high concentration risk (top 10 holders control 60%). Development activity slowed by 40% in past month. Risk of further decline to $0.04 with stop loss at $0.065. HIGH PRIORITY SELL: Recommended reduction from 20% to 5% allocation, with freed capital reallocated to more stable assets. This position should be reduced first when portfolio rebalancing is needed."

RESPONSE FORMAT:
You must respond with a valid JSON object in the following format:
{
  "coins": [
    {
      "symbol": "string",
      "address": "string",
      "allocation": number,
      "analysis": "string",
      "sentiment": "positive/negative/neutral",
      "recommendation": "buy/sell/hold",
      "priority": "high/medium/low"
    }
  ]
}

Do not include any markdown formatting, code blocks, or additional text outside of the JSON structure.
Ensure all string values are properly escaped and the JSON is valid.
The total allocation across all coins must equal 100%.`;

  constructor(
    @InjectModel('TrendToken')
    private trendTokenModel: Model<TrendToken>,
  ) {}

  async decisionMaker(
    state: typeof AgentState.State,
    config?: RunnableConfig,
  ): Promise<{ messages: HumanMessage[] }> {
    try {
      // 모든 메시지를 모아서 통합 분석을 위한 컨텍스트 생성
      const allMessagesContent = state.messages
        .map((msg) => `${msg.name ? `[${msg.name}]: ` : ''}${msg.content}`)
        .join('\n\n');

      // 메시지 생성
      const messages = [
        new SystemMessage(this.SYSTEM_PROMPT),
        new HumanMessage(allMessagesContent),
      ];

      // 모델 호출
      const response = await gpt4oMini.invoke(messages, config);

      try {
        // 응답 내용을 문자열로 변환
        const contentString = extractTextFromMessageContent(response.content);

        if (!contentString) {
          throw new Error('Empty response from model');
        }

        // 마크다운 코드 블록 제거
        const cleanContent = contentString
          .replace(/```json\n?|\n?```/g, '')
          .trim();

        const parsedResponse = JSON.parse(
          cleanContent,
        ) as DecisionMakerResponse;

        // 각 코인의 심볼과 이름을 coinMetaModel에서 검색하여 업데이트
        for (const coin of parsedResponse.coins) {
          if (!coin.address) {
            console.warn(`주소 없는 코인 발견: ${coin.symbol || 'unknown'}`);
            continue;
          }

          try {
            const coinMeta = await this.trendTokenModel.findOne({
              address: coin.address,
            });
            if (coinMeta) {
              coin.symbol = coinMeta.symbol;
              coin.name = coinMeta.name;
            } else {
              console.warn(`메타데이터를 찾을 수 없는 코인: ${coin.address}`);
            }
          } catch (dbError) {
            console.error(`코인 메타데이터 조회 중 오류: ${dbError.message}`);
          }
        }

        return {
          messages: [
            new HumanMessage({
              content: JSON.stringify(parsedResponse, null, 2),
              name: 'decisionMaker',
            }),
          ],
        };
      } catch (parseError) {
        console.error('Response parsing error:', parseError);
        throw new Error(`응답 파싱 실패: ${parseError.message}`);
      }
    } catch (error) {
      console.error('Decision maker error:', error);

      const errorMessage = {
        error: 'Failed to perform decision maker',
        details: error.message,
        timestamp: new Date().toISOString(),
      };

      return {
        messages: [
          new HumanMessage({
            content: JSON.stringify(errorMessage, null, 2),
            name: 'decisionMaker',
          }),
        ],
      };
    }
  }
}
