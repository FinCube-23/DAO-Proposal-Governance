import { api } from '@/core/api/client';
import { ANALYTICS_ENDPOINT, USER_ENDPOINT } from '@/core/api/endpoints';

export interface UpdateUserProfilePayload {
  email?: string;
  contact_number?: string;
  wallet_address?: string;
}

export interface UpdateUserProfileResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  contact_number: string;
  wallet_address?: string;
  is_active: boolean;
  is_staff: boolean;
  status: string;
  updated_at: string;
}

export const userApis = {
  updateProfile: (payload: UpdateUserProfilePayload) =>
    api.patch<UpdateUserProfileResponse>(`${USER_ENDPOINT.BASE}/profile/update`, payload),
  getAnalytics: () =>
    api.get(`${ANALYTICS_ENDPOINT.BASE}/analytics/stats`),
};
