import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { FundData } from 'src/common/schemas/fund-data.schema';
import { CreateAgentDto } from './dto/req.dto';
import { gpt4oMini } from '../agent/utils/model';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

@Injectable()
export class EvolutionService {
  constructor(
    @InjectModel('FundData')
    private fundDataModel: Model<FundData>,
  ) {}

  // Helper method to generate fund name and symbol using AI
  private async generateFundNameAndSymbol(
    strategy: string,
    parentNames: string[],
  ): Promise<{ name: string; symbol: string }> {
    try {
      const systemMessage = new SystemMessage(
        `You are a crypto fund naming expert creating HIGHLY DISTINCTIVE and CREATIVE names for new investment funds.
        
        ANALYZE THE STRATEGY to extract what makes it TRULY UNIQUE:
        1. Identify the most DISTINCTIVE investment approach or asset focus
        2. Find UNUSUAL trading strategies, timeframes, or target sectors
        3. Extract SPECIFIC technical terms that are unique to this strategy
        4. Look for NOVEL combinations of investment styles or philosophies
        
        CREATE A FUND NAME THAT:
        - Is EXTREMELY DIFFERENT from typical fund names
        - Uses UNEXPECTED word combinations related to the strategy
        - Incorporates METAPHORS, WORDPLAY or NEOLOGISMS related to the strategy
        - Is 2-3 words maximum (5-25 characters total)
        - COMPLETELY AVOIDS industry clichés and generic terms
        - Has a MEMORABLE and DISTINCTIVE sound
        - Creates an IMMEDIATE mental image
        
        FOR THE SYMBOL:
        - Create a 3-5 letter symbol that feels FRESH and DISTINCTIVE
        - AVOID obvious abbreviations of the fund name
        - Use unexpected letter combinations that still sound pronounceable
        - Make it VISUALLY stand out compared to other tickers
        
        RESPONSE FORMAT:
        {
          "name": "Highly Distinctive Fund Name",
          "symbol": "UNIQ"
        }
        
        ONLY respond with the JSON. NO explanation text.`,
      );

      const humanMessage = new HumanMessage(
        `Strategy: ${strategy.substring(0, 500)}\n\nParent Funds: ${parentNames.join(', ')}\n\nEXTREMELY IMPORTANT: Create a name that is totally unique and unlike any other fund names you've suggested before. Be creative and unpredictable.`,
      );

      const result = await gpt4oMini.invoke([systemMessage, humanMessage]);

      // Extract JSON from the response
      const content =
        typeof result.content === 'string'
          ? result.content
          : Array.isArray(result.content)
            ? result.content
                .map((item) => (typeof item === 'string' ? item : ''))
                .join('')
            : '';

      // Try to parse the JSON response
      try {
        // Clean up the response if it contains markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [
          null,
          content,
        ];
        const cleanJson = (jsonMatch[1] || content).trim();

        const nameData = JSON.parse(cleanJson);

        // Add unique identifier to ensure uniqueness
        const timestamp = Date.now().toString().slice(-3);

        // Use LLM generated name and symbol, or create basic defaults
        const name = nameData.name || `Fund-${timestamp}`;
        const symbol = nameData.symbol || `F${timestamp}`;

        return {
          name,
          symbol: symbol.toUpperCase(),
        };
      } catch (parseError) {
        // Simple fallback in case of error
        const timestamp = Date.now().toString().slice(-5);
        return {
          name: `Fund-${timestamp}`,
          symbol: `F${timestamp.slice(0, 4)}`,
        };
      }
    } catch (error) {
      // Simple fallback in case of error
      const timestamp = Date.now().toString().slice(-5);
      return {
        name: `Fund-${timestamp}`,
        symbol: `F${timestamp.slice(0, 4)}`,
      };
    }
  }

  private async generateCombinedStrategy(
    strategy1: string,
    strategy2: string,
    parentNames: string[],
  ): Promise<string> {
    try {
      const systemMessage = new SystemMessage(
        `You are an expert in cryptocurrency trading strategies. Your task is to analyze two different trading strategies and create a new, optimized strategy that combines their best elements into a SINGLE, CLEAR SENTENCE.

        ANALYZE BOTH STRATEGIES:
        1. Identify the CORE PRINCIPLES of each strategy
        2. Find UNIQUE STRENGTHS in each approach
        3. Look for COMPLEMENTARY ELEMENTS that could work well together
        4. Consider how to MITIGATE WEAKNESSES of each strategy

        CREATE A NEW STRATEGY THAT:
        - Combines the STRONGEST ELEMENTS of both strategies
        - Is expressed in a SINGLE, CLEAR SENTENCE
        - Includes SPECIFIC CRITERIA for investment decisions
        - Maintains a COHERENT and LOGICAL flow
        - Is CONCISE but COMPREHENSIVE
        - Avoids CONTRADICTIONS between the two strategies
        - Optimizes for LONG-TERM PERFORMANCE
        - Includes CLEAR ENTRY and EXIT CRITERIA
        - Considers RISK MANAGEMENT

        RESPONSE FORMAT:
        Return ONLY a single sentence that describes the complete strategy. No additional explanation or formatting.`,
      );

      const humanMessage = new HumanMessage(
        `Strategy 1: ${strategy1}\n\nStrategy 2: ${strategy2}\n\nParent Fund Names: ${parentNames.join(', ')}\n\nCreate a new, optimized strategy that combines the best elements of both approaches into a single, clear sentence.`,
      );

      const result = await gpt4oMini.invoke([systemMessage, humanMessage]);

      const content =
        typeof result.content === 'string'
          ? result.content
          : Array.isArray(result.content)
            ? result.content
                .map((item) => (typeof item === 'string' ? item : ''))
                .join('')
            : '';

      // 결과가 여러 문장이면 첫 번째 문장만 사용
      return content.split('.')[0] + '.';
    } catch (error) {
      console.error('Error generating combined strategy:', error);
      return `${strategy1}\n\nAlso consider the following strategy:\n\n${strategy2}`;
    }
  }

  async createGeneration() {
    const allFunds = await this.fundDataModel
      .find({
        survived: true,
      })
      .lean();

    const generations = allFunds.map((fund) => fund.generation || 0);
    const maxGeneration = generations.length > 0 ? Math.max(...generations) : 0;
    const newGeneration = maxGeneration + 1;

    // Find funds with totalPnL field for ranking
    const fundsWithPnL = allFunds.filter((fund) => fund.totalPnL != null);

    // Get top 5 funds by totalPnL
    const topFundsByPnL = fundsWithPnL
      .sort((a, b) => (b.totalPnL || 0) - (a.totalPnL || 0))
      .slice(0, 5)
      .map((fund) => ({
        _id: fund._id,
        name: fund.name,
        totalPnL: fund.totalPnL,
        strategyPrompt: fund.strategyPrompt,
      }));

    // Get bottom 5 funds by totalPnL (if there are enough funds)
    const bottomFundIds = [];
    if (fundsWithPnL.length > 5) {
      const bottomFunds = fundsWithPnL
        .sort((a, b) => (a.totalPnL || 0) - (b.totalPnL || 0))
        .slice(0, 5);

      bottomFundIds.push(...bottomFunds.map((fund) => fund._id));

      // Update bottom 5 funds to set survived = false
      const updatePromises = bottomFundIds.map((fundId) =>
        this.fundDataModel
          .findByIdAndUpdate(
            fundId,
            { $set: { survived: false } },
            { new: true },
          )
          .catch(() => null),
      );

      try {
        await Promise.all(updatePromises);
      } catch (error) {
        // Silently handle errors
      }
    }

    // Create 10 new strategies by combining strategyPrompts from top 5 funds
    const combinedStrategies = [];

    // Generate all combinations of 2 from top 5 funds (5C2 = 10 combinations)
    for (let i = 0; i < topFundsByPnL.length; i++) {
      for (let j = i + 1; j < topFundsByPnL.length; j++) {
        // Combine two strategies using LLM
        const strategy1 = topFundsByPnL[i].strategyPrompt || '';
        const strategy2 = topFundsByPnL[j].strategyPrompt || '';
        const parentNames = [topFundsByPnL[i].name, topFundsByPnL[j].name];

        const combinedStrategy = await this.generateCombinedStrategy(
          strategy1,
          strategy2,
          parentNames,
        );

        combinedStrategies.push({
          strategy: combinedStrategy,
          parentFunds: [
            { id: topFundsByPnL[i]._id, name: topFundsByPnL[i].name },
            { id: topFundsByPnL[j]._id, name: topFundsByPnL[j].name },
          ],
        });
      }
    }

    return {
      newGeneration,
      topFundsByPnL,
      combinedStrategies,
      bottomFundIds,
    };
  }

  @Cron('50 7 * * 1') // 매주 월요일 오전 7시 50분 실행
  async createEvolution() {
    try {
      console.log(
        'Monday 07:50: Starting evolution process - eliminating bottom 5 funds and creating new generation',
      );

      const { newGeneration, combinedStrategies, bottomFundIds } =
        await this.createGeneration();

      // Check if there are enough funds for elimination
      if (bottomFundIds.length < 5) {
        console.warn(
          `Warning: Insufficient number of funds for elimination (found ${bottomFundIds.length}, need 5)`,
        );
      }

      // 기존 펀드 이름과 심볼 중복 방지
      const existingFunds = await this.fundDataModel
        .find({}, 'name symbol')
        .lean();
      const existingNames = new Set(
        existingFunds.map((fund) => fund.name.toLowerCase()),
      );
      const existingSymbols = new Set(
        existingFunds.map((fund) => fund.symbol.toUpperCase()),
      );

      // 새 펀드 생성
      const newFunds = [];
      const parentOffspringUpdates = new Map(); // 부모 펀드의 자식 업데이트 추적

      console.log(
        `Starting generation ${newGeneration} - creating ${combinedStrategies.length} new funds from strategy combinations`,
      );

      // 조합된 전략으로만 새 펀드 생성
      for (const combined of combinedStrategies) {
        // AI 기반 이름과 심볼 생성
        const parentNames = [
          combined.parentFunds[0].name,
          combined.parentFunds[1].name,
        ];

        // 유니크한 이름과 심볼 생성 (최대 3번 시도)
        let nameSymbolPair = null;
        let attempts = 0;

        while (!nameSymbolPair && attempts < 3) {
          attempts++;
          const { name, symbol } = await this.generateFundNameAndSymbol(
            combined.strategy,
            parentNames,
          );

          // 이름이나 심볼이 이미 존재하면 다음 시도로
          if (
            !existingNames.has(name.toLowerCase()) &&
            !existingSymbols.has(symbol.toUpperCase())
          ) {
            nameSymbolPair = { name, symbol };
          }
        }

        // 3번 시도 후에도 실패하면 타임스탬프로 확실히 구분
        if (!nameSymbolPair) {
          const timestamp = Date.now().toString().slice(-6);
          nameSymbolPair = {
            name: `Fund-${timestamp}`,
            symbol: `F${timestamp.substring(0, 4)}`,
          };
          console.warn(
            `Failed to generate unique name/symbol - using fallback: ${nameSymbolPair.name} (${nameSymbolPair.symbol})`,
          );
        }

        // 생성된 이름과 심볼을 목록에 추가하여 다음 펀드에서 중복 방지
        existingNames.add(nameSymbolPair.name.toLowerCase());
        existingSymbols.add(nameSymbolPair.symbol.toUpperCase());

        // 펀드 생성
        try {
          const newFund = new this.fundDataModel({
            name: nameSymbolPair.name,
            symbol: nameSymbolPair.symbol,
            address: '7Uuzh9JwqF8z3u6MWpQuQJbpD1u46xPDY6PGjwfwTh4o',
            initialBalance: 10000,
            balance: 10000,
            imageUrl:
              'https://dev-memetus-s3.s3.ap-northeast-2.amazonaws.com/kol-image/gen2_token_3.png',
            generation: newGeneration,
            strategyPrompt: combined.strategy,
            portfolio: [],
            offspring: [],
            survived: true,
          });

          const savedFund = await newFund.save();
          newFunds.push(savedFund);
          console.log(
            `New fund created: ${savedFund.name} (${savedFund.symbol}) - Generation ${newGeneration}`,
          );

          // 각 부모 펀드의 자식 목록에 새 펀드 ID 추가
          combined.parentFunds.forEach((parent) => {
            if (!parentOffspringUpdates.has(parent.id.toString())) {
              parentOffspringUpdates.set(parent.id.toString(), []);
            }
            parentOffspringUpdates
              .get(parent.id.toString())
              .push(savedFund._id);
          });
        } catch (fundCreationError) {
          console.error(
            `Error creating fund ${nameSymbolPair.name}: ${fundCreationError.message}`,
          );
        }
      }

      // 모든 부모 펀드의 offspring 필드 업데이트
      const updatePromises = [];
      for (const [parentId, offspringIds] of parentOffspringUpdates.entries()) {
        updatePromises.push(
          this.fundDataModel
            .findByIdAndUpdate(
              parentId,
              { $push: { offspring: { $each: offspringIds } } },
              { new: true },
            )
            .then((updated) => {
              if (updated) {
                console.log(
                  `Parent fund ${updated.name} - ${offspringIds.length} offspring funds connected`,
                );
              }
              return updated;
            })
            .catch((error) => {
              console.error(
                `Failed to update parent fund ${parentId}: ${error.message}`,
              );
              return null;
            }),
        );
      }

      // 모든 업데이트 완료 대기
      await Promise.all(updatePromises);

      // 하위 펀드 ID 목록이 있으면 로그
      if (bottomFundIds && bottomFundIds.length > 0) {
        const eliminatedFunds = await this.fundDataModel
          .find({ _id: { $in: bottomFundIds } }, 'name symbol totalPnL')
          .lean();

        console.log('-----------------------------------');
        console.log('Eliminated funds with lowest performance:');
        eliminatedFunds.forEach((fund) => {
          console.log(
            `- ${fund.name} (${fund.symbol}): ${fund.totalPnL}% return`,
          );
        });
        console.log('-----------------------------------');
      }

      console.log(
        `Evolution process completed - Generation ${newGeneration}: ${newFunds.length} funds created, ${bottomFundIds.length} funds eliminated`,
      );

      return {
        generation: newGeneration,
        newFundIds: newFunds.map((fund) => fund._id),
        parentUpdates: Object.fromEntries(parentOffspringUpdates),
        eliminatedFundIds: bottomFundIds,
      };
    } catch (error) {
      console.error(
        `Critical error during evolution process: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  createAgent(createFundDto: CreateAgentDto) {
    const newFundData = {
      ...createFundDto,
      balance: createFundDto.initialBalance,
      portfolio: [],
      offspring: [],
      nav: 0,
      realizedProfit: 0,
      unrealizedProfit: 0,
      totalProfit: 0,
    };

    return this.fundDataModel.create(newFundData);
  }
}
