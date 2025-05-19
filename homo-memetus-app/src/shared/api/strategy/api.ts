import { API_RESPONSE_CODE } from '@/shared/constants/api';
import {
  PromptUsedCountPrarams,
  StrategyCreateParams,
  StrategyCreateResponse,
  StrategyParams,
  StrategyResponse,
  TokenRecommendationParams,
} from '@/shared/types/data/api.type';
import axios from 'axios';
import { getCookie } from 'cookies-next';

export const createStrategy = async (
  params: StrategyCreateParams,
): Promise<StrategyCreateResponse | Error> => {
  try {
    const response = await axios.post(
      '/api/strategy',
      {
        contents: params.contents,
      },
      {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
      },
    );

    if (API_RESPONSE_CODE.POST === response.status) {
      return response.data;
    }

    throw new Error('Failed to create strategy');
  } catch (error) {
    throw new Error((error as Error).message || 'Unexpected error occurred');
  }
};

export const fetchStrategy = async ({
  page,
  limit,
}: StrategyParams): Promise<StrategyResponse | Error> => {
  try {
    const response = await axios.get(
      `/api/strategy/all?page=${page}&pageSize=${limit}`,
    );
    if (API_RESPONSE_CODE.GET === response.status) {
      return response.data;
    }
    return new Error('Failed to get strategy');
  } catch (error) {
    return new Error((error as Error).message || 'Unexpected error occurred');
  }
};

export const getTokenRecommendation = async ({
  prompt,
  accessToken,
}: TokenRecommendationParams) => {
  try {
    const response = await axios.post(
      '/prompt-gpt/post',
      {
        prompt,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (API_RESPONSE_CODE.POST === response.status) {
      return response.data;
    }
  } catch (error) {
    throw new Error((error as Error).message || 'Unexpected error occurred');
  }
};

export const getUsedCount = async (accessToken?: string) => {
  if (!accessToken) {
    return null;
  }
  try {
    const response = await axios.get('/prompt-gpt/prompt-number', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (err) {
    throw new Error((err as Error).message || 'Unexpected error occurred');
  }
};

export const updateUseCount = async () => {
  const accessToken = getCookie('accessToken');
  try {
    const response = await axios.get('/prompt-gpt/count', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (API_RESPONSE_CODE.GET === response.status) {
      return response.data;
    }
  } catch (err) {
    throw new Error((err as Error).message || 'Unexpected error occurred');
  }
};
