import { AllAgentType } from '@/shared/types/data/agent.type';
import { GetAllAgentParams } from '@/shared/types/data/api.type';
import { HoldingsTokenQueryType } from '@/shared/types/data/portfolio';
import axios from 'axios';

export const getAllAgents = async ({
  page,
  pageSize,
  sort,
  sortOrder,
}: GetAllAgentParams) => {
  try {
    const response = await axios.get(
      `/api/agent-data/agent-dashboard?sortOrder=${sortOrder}&sort=${sort}&page=${page}&pageSize=${pageSize}`,
    );

    if (response.status === 200) {
      return response.data as AllAgentType;
    }

    throw new Error('Failed to fetch agents');
  } catch (error) {
    throw new Error((error as Error).message || 'Unexpected error occurred');
  }
};

export const getAgentMetadata = async (id: string) => {
  try {
    const response = await axios.get(`/api/agent-data/agent-metadata/${id}`);

    if (response.status === 200) {
      return response.data;
    }

    throw new Error('Failed to fetch agent metadata');
  } catch (error) {
    throw new Error((error as Error).message || 'Unexpected error occurred');
  }
};

export const getAgentStat = async (id: string) => {
  try {
    const response = await axios.get(`/api/agent-data/agent-stat/${id}`);

    if (response.status === 200) {
      return response.data;
    }

    throw new Error('Failed to fetch agent stat');
  } catch (error) {
    throw new Error((error as Error).message || 'Unexpected error occurred');
  }
};

export const getAgentHolding = async (
  id: string,
  page: number,
  sort: HoldingsTokenQueryType,
  sortOrder: 'asc' | 'desc',
) => {
  try {
    const response = await axios.get(
      `/api/agent-data/portfolio/holdings/${id}?sort=${sort}&sortOrder=${sortOrder}&page=${page}&pageSize=10`,
    );

    if (response.status === 200) {
      return response.data;
    }

    throw new Error('Failed to fetch agent holding');
  } catch (error) {
    throw new Error((error as Error).message || 'Unexpected error occurred');
  }
};

export const getAgentActivity = async (id: string, page: number) => {
  try {
    const response = await axios.get(
      `/api/agent-data/portfolio/activity/${id}?page=${page}&pageSize=10`,
    );

    if (response.status === 200) {
      return response.data;
    }

    throw new Error('Failed to fetch agent activity');
  } catch (error) {
    new Error((error as Error).message || 'Unexpected error occurred');
  }
};

export const getAgentDashboard = async ({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) => {
  try {
    const response = await axios.get(
      `/api/agent-data/agent-dashboard?sort=${'totalPnL'}&sortOrder=${'desc'}&page=${page}&pageSize=${pageSize}`,
    );

    if (response.status === 200) {
      return response.data;
    }
    throw new Error('Failed to fetch agent dashboard');
  } catch (error) {
    throw new Error((error as Error).message || 'Unexpected error occurred');
  }
};

export const getAgentBubbleDashboard = async () => {
  try {
    const response = await axios.get(
      '/api/agent-data/agent-dashboard/bubble-chart',
    );

    if (response.status === 200) {
      return response.data;
    }

    throw new Error('Failed to fetch agent bubble dashboard');
  } catch (error) {
    throw new Error((error as Error).message || 'Unexpected error occurred');
  }
};

export const getAgentTopPicks = async ({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) => {
  try {
    const response = await axios.get(
      `/api/agent-data/agent-dashboard/top-pics?page=${page}&pageSize=${pageSize}`,
    );

    if (response.status === 200) {
      return response.data;
    }

    throw new Error('Failed to fetch agent top picks');
  } catch (error) {
    throw new Error((error as Error).message || 'Unexpected error occurred');
  }
};

export const getRealAgentTopPicks = async ({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) => {
  try {
    const response = await axios.get(
      `/api/agent-data/agent-dashboard/real-trading/top-pics?page=${page}&pageSize=${pageSize}`,
    );

    if (response.status === 200) {
      return response.data;
    }

    throw new Error('Failed to fetch real agent top picks');
  } catch (error) {
    throw new Error((error as Error).message || 'Unexpected error occurred');
  }
};

export const getAgentById = async (id: string) => {
  try {
    const response = await axios.get(`/api/agent-data/agent-dashboard/${id}`);

    if (response.status === 200) {
      return response.data;
    }

    throw new Error('Failed to fetch agent by ID');
  } catch (error) {
    throw new Error((error as Error).message || 'Unexpected error occurred');
  }
};

export const searchAgentBySymbol = async (symbol: string) => {
  try {
    const response = await axios.get(
      `/api/agent-data/agent-dashboard/search?search=${symbol}`,
    );

    if (response.status === 200) {
      return response.data;
    }
    throw new Error('Failed to search agent by symbol');
  } catch (error) {
    throw new Error((error as Error).message || 'Unexpected error occurred');
  }
};

export const getAgentGraph = async (id: string) => {
  try {
    const response = await axios.get(
      `/api/agent-data/agent-dashboard/real-trading/graph/${id}`,
    );

    if (response.status === 200) {
      return response.data;
    }

    throw new Error('Failed to fetch agent graph');
  } catch (error) {
    throw new Error((error as Error).message || 'Unexpected error occurred');
  }
};
