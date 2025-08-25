import type { RegisterPayload, RegisterResponse } from '@/core/api/types';
import { api } from '@/core/api/client';
import { AUTH_ENDPOINTS } from '@/core/api/endpoints';

export function register(payload: RegisterPayload) {
  return api.post<RegisterResponse>(`${AUTH_ENDPOINTS.BASE}/register`, payload);
}
