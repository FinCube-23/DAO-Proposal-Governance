import type { LoginPayload, LoginResponse } from '@/core/api/types';
import { api } from '@/core/api/client';
import { USER_ENDPOINT } from '@/core/api/endpoints';

export function login(payload: LoginPayload) {
  return api.post<LoginResponse>(`${USER_ENDPOINT.BASE}/login`, payload);
}
