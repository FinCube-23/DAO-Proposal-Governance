import type { FetchMeResponse } from '@/core/api/types';
import { api } from '@/core/api/client';
import { USER_ENDPOINT } from '@/core/api/endpoints';

export function fetchMe() {
  return api.get<FetchMeResponse>(`${USER_ENDPOINT.BASE}/profile`);
}
