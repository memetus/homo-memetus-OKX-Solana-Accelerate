export type UserLoginParams = {
  wallet: string;
  timezone: string;
};

export type UserLoginResponse = {
  userId: string;
  accessToken: string;
  createAt: string;
};

export type StrategyCreateParams = {
  accessToken: string;
  contents: string;
};

export type StrategyCreateResponse = {
  contents: string;
  createdat: string;
  updatedAt: string;
  userWallet: string;
  _id: string;
  _v: number;
};

export type StrategyParams = {
  page: number;
  limit: number;
};

export type StrategyResponse = {
  strategies: StrategyCreateResponse[];
  total: number;
};

export type TokenRecommendationParams = {
  prompt: string;
  accessToken: string;
};

export type PromptUsedCountPrarams = {
  accessToken: string;
};

export type GetAllAgentParams = {
  page: number;
  pageSize: number;
  sort: AgentSortType;
  sortOrder: 'asc' | 'desc';
};

export type AgentSortType =
  | 'realized'
  | 'unrealized'
  | 'totalPnL'
  | 'nav'
  | 'age';
