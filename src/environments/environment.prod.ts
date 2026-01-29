import { getApiBaseUrl } from './env.utils';

export const environment = {
  production: true,
  apiBaseUrl: getApiBaseUrl('https://localhost:8002')
};