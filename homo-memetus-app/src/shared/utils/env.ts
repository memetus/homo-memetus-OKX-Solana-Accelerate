import { ValidEnvType } from '@/shared/types/etc/env';

export const getEnv = (key: ValidEnvType, defaultValue?: string): string => {
  const _key = `NEXT_PUBLIC_${key}`;
  const value = process.env[_key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value || defaultValue!;
};
