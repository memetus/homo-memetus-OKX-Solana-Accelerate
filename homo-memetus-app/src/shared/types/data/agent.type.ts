export type AllAgentType = {
  totalCount: number;
  results: AllAgentItem[];
};

export type AllAgentItem = {
  nav: number;
  fundId: number;
  name: string;
  realizedProfit: number;
  totalPnL: number;
  unrealizedProfit: number;
  createdAt: string;
};

export type AgentMetadataType = {
  name: string;
  strategy: string;
  fundAmount: number;
  fundId: string;
  createdAt: string;
};

export type AgentStatType = {
  fundId: string;
  nav: number;
  realizedProfit: number;
  unrealizedProfit: number;
  totalPnL: number;
};

export type AgentGraphType = {
  fundId: string;
  generation: number;
  name: string;
  offspring: string[];
  survived: boolean;
  totalPnL: number;
  realTrading: boolean;
};

export type AgentDashboardResponse = {
  totalCount: number;
  results: AgentDashboardType[];
};

export type AgentDashboardType = {
  fundId: string;
  generation: number;
  name: string;
  nav: number;
  realizedProfit: number;
  strategyPrompt: string;
  survived: boolean;
  totalPnL: number;
  unrealizedProfit: number;
  imageUrl: string;
  realTrading: boolean;
};

export type AgentPick = {
  token: string;
  totalPnL: number;
};

export type AgentDashboardDetailType = AgentDashboardType & {
  topPics: AgentPick[];
};

export type AgentTopPickType = {
  fundId: string;
  fundName: string;
  strategyPrompt: string;
  token: string;
  totalPnL: number;
  address: string;
};

export type AgentTopPickResponse = {
  totalCount: number;
  results: AgentTopPickType[];
};

export type AgentSearchResultType = {
  fundId: string;
  token: string;
  address: string;
  strategyPrompt: string;
  totalPnL: number;
  imageUrl: string;
  fundName: string;
};
