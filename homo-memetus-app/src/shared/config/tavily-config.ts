import { TavilySearchOptions } from '@/shared/types/etc/tavily';

export const tavilyOption: TavilySearchOptions = {
  searchDepth: 'advanced',
  topic: 'finance',
  days: 7,
};

export const tavilyToolOption = {
  name: 'tavily-tool',
  description:
    'A tool to search about memecoins on solana ecosystem  web use tavily.',
  schema: {
    query: {
      type: 'string',
      description:
        'The query to search for. It can be memecoin of solana ecosystem.',
    },
  },
};
