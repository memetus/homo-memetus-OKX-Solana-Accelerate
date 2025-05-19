import { API_RESPONSE_CODE } from '@/shared/constants/api';
import {
  UserLoginParams,
  UserLoginResponse,
} from '@/shared/types/data/api.type';
import axios from 'axios';

export const userLogin = async (
  params: UserLoginParams,
): Promise<UserLoginResponse | Error> => {
  try {
    const response = await axios.post('/api/users/login', params);

    if (API_RESPONSE_CODE.POST === response.status) {
      return response.data;
    }
    return new Error('Failed to login');
  } catch (error) {
    return new Error((error as Error).message || 'Unexpected error occurred');
  }
};

export const deleteJwtCookie = async () => {
  try {
    await axios.delete('/api/cookie');
  } catch (error) {
    return new Error((error as Error).message || 'Unexpected error occurred');
  }
};
