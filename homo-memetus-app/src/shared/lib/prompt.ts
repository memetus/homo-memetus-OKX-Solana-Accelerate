import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import {
  responseList,
  tokenFormatPrompt,
  tokenRecommendatonPrompt,
} from '@/shared/constants/agent';
import { getTokenRecommendation } from '@/shared/api/strategy/api';
import { getCookie } from 'cookies-next';

export const handleOutputFormat = async (text: string) => {
  try {
    const apiKey = `${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`;
    const model = new ChatOpenAI({
      apiKey,
      model: 'gpt-4o-2024-08-06',
      temperature: 0,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      new SystemMessage(tokenFormatPrompt),
      new HumanMessage(text),
    ]);

    const chain = prompt.pipe(model);

    const response = await chain.invoke({
      prompt: text,
    });

    return response;
  } catch (error) {
    console.log(error);
    throw new Error((error as Error).message || 'Unexpected error occurred');
  }
};

export const handleGeneratePrompt = async (text: string) => {
  const accessToken = getCookie('accessToken');
  try {
    const apiKey = `${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`;
    const model = new ChatOpenAI({
      apiKey,
      model: `${process.env.NEXT_PUBLIC_MARKET_ANALYSIS_MODEL_ID}`,
      temperature: 0,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      new SystemMessage(tokenRecommendatonPrompt),
      new HumanMessage(text),
    ]);

    const chain = prompt.pipe(model);

    const response = await chain.invoke({ prompt: text });

    const token = await getTokenRecommendation({
      prompt: response.content as string,
      accessToken: accessToken as string,
    });

    return token;
  } catch (error) {
    throw new Error((error as Error).message || 'Unexpected error occurred');
  }
};

export const parseTokenFormat = (token: string) => {
  const nameMatch =
    token.match(/name:\s*([^,]+)/) || token.match(/Name:\s*([^,]+)/);
  const symbolMatch =
    token.match(/symbol:\s*([^,]+)/) || token.match(/Symbol:\s*([^,]+)/);
  const addressMatch =
    token.match(/address:\s*([^,]+)/) || token.match(/Address:\s*([^,]+)/);
  const commentMatch =
    token.match(/comment:\s*(.+)/) ||
    token.match(/Comment:\s*(.+)/) ||
    token.match(/Analysis:\s*(.+)/);

  return {
    tokens: [
      {
        name: nameMatch ? nameMatch[1].trim() : '',
        symbol: symbolMatch ? symbolMatch[1].trim() : '',
        address: addressMatch ? addressMatch[1].trim() : '',
        comment: commentMatch ? commentMatch[1].trim() : '',
      },
    ],
  };
};

const getUniqueText = () => {
  const index = Math.floor(Math.random() * responseList.length);
  return responseList[index];
};

export const parseTokenAggregation = (token: string) => {
  const SOLANA_ADDRESS_REGEX = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
  const t = token.replace(/[*#-]/g, '').replace(/=/g, ':').replace(/\n/g, '.');
  const sep = ['.'];
  let chunk = [];
  const result = [];

  for (const s of sep) {
    chunk.push(t.split(s));
  }

  const chunks = chunk.flat();

  for (const c of chunks) {
    result.push([...parseTokenFormat(c).tokens]);
  }

  const tokens = result.flat();

  const seen = new Set();
  const uniqueTokens = tokens.filter((item) => {
    const value = item.address;
    if (seen.has(value) || !value.match(SOLANA_ADDRESS_REGEX)) {
      return false;
    }
    seen.add(value);
    return true;
  });

  const strategy = getUniqueText();
  return {
    strategy,
    tokens: uniqueTokens,
  };
};
