export type AgentActivityListType = {
  results: AgentActivityType[];
  totalCount: number;
};

export type AgentActivityType = {
  type: 'buy' | 'sell';
  profit: number | null;
  token: string;
  total: number | null;
  createdAt: string;
  yaps: string;
};

export type AgentHoldingsListType = {
  results: AgentHoldingsType[];
  totalCount: number;
};

export type AgentHoldingsType = {
  nav: number;
  realizedProfit: number;
  unrealizedProfit: number;
  totalPnL: number;
  token: string;
  address: string;
};

export type HoldingsTokenQueryType =
  | 'realized'
  | 'unrealized'
  | 'totalPnL'
  | 'nav';
