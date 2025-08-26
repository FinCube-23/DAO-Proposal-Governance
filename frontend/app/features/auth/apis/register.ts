import type { RegisterPayload, RegisterResponse } from '@/core/api/types';
import { api } from '@/core/api/client';
import { USER_ENDPOINT } from '@/core/api/endpoints';

export function register(payload: RegisterPayload) {
  return api.post<RegisterResponse>(`${USER_ENDPOINT.BASE}/register`, payload);
}
