import { environment } from '@env/environment';

export const API = {
  BASE_URL: environment.apiUrl,
  TIMEOUT: 30_000,
} as const;
