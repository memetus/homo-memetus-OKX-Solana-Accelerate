export type TavilySearchOptions = {
  searchDepth?: 'basic' | 'advanced';
  topic?: 'general' | 'news' | 'finance';
  days?: number;
  maxResults?: number;
  includeImages?: boolean;
  includeImageDescriptions?: boolean;
  includeAnswer?: boolean;
  includeRawContent?: boolean;
  includeDomains?: undefined | Array<string>;
  excludeDomains?: undefined | Array<string>;
  maxTokens?: undefined | number;
};
