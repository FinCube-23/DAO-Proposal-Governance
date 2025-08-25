import type { FetchMeResponse } from '@/core/services/org/types';
import { api } from '@/core/api/client';
import { AUTH_ENDPOINTS } from '@/core/api/endpoints';

export function fetchMe() {
  return api.get<FetchMeResponse>(`${AUTH_ENDPOINTS.BASE}/profile`);
}
