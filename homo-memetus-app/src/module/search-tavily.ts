import { tavily } from '@tavily/core';
import { tavilyOption } from '@/shared/config/tavily-config';

export const createTavilyClient = () => {
  const tavilyClient = tavily({
    apiKey: process.env.TAVILY_API_KEY,
  });

  return tavilyClient;
};

export const queryTavily = async ({ query }: { query: string }) => {
  try {
    const tavilyClient = createTavilyClient();

    const searchResult = await tavilyClient.search(query, tavilyOption);

    return searchResult;
  } catch (error) {
    throw new Error(error as string);
  }
};
