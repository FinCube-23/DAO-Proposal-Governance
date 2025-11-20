import type { OnchainVerificationResponse } from '@/core/services/superadmin/types';
import type { SuperAdminOrgResponse } from '@/features/superadmin-organizations/types';
import type { SuperAdminUserListResponse, SuperAdminUserResponse } from '@/features/superadmin-users/types';
import { api } from '@/core/api/client';
import { ANALYTICS_ENDPOINT, ORGANIZATION_ENDPOINT, USER_ENDPOINT } from '@/core/api/endpoints';

export const superadminApis = {
  getAnalytics: (): Promise<SuperAdminUserResponse> =>
    api.get(`${ANALYTICS_ENDPOINT.BASE}/analytics/stats`),
  getOrganizations: (params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    type?: string;
    is_active?: boolean;
    sort_by?: string;
    order?: string;
  }): Promise<SuperAdminOrgResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', params.page.toString());
    queryParams.append('limit', params.limit.toString());
    if (params.search)
      queryParams.append('search', params.search);
    if (params.status && params.status !== 'all')
      queryParams.append('status', params.status);
    if (params.type && params.type !== 'all')
      queryParams.append('type', params.type);
    if (params.is_active !== undefined)
      queryParams.append('is_active', params.is_active.toString());
    if (params.sort_by)
      queryParams.append('sort_by', params.sort_by);
    if (params.order)
      queryParams.append('order', params.order);

    return api.get(`${ORGANIZATION_ENDPOINT.BASE}?${queryParams.toString()}`);
  },
  updateOrganizationStatus: (params: {
    organization_ids: number[];
    status: string;
  }): Promise<{
    status: string;
    message: string;
    data: {
      updated_count: number;
      updated_ids: number[];
      skipped_ids: number[];
    };
  }> => {
    return api.patch(`${ORGANIZATION_ENDPOINT.BASE}/update-status`, params);
  },
  getUsers: (params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    is_active?: boolean;
    is_verified_email?: boolean;
    is_verified_contact_number?: boolean;
    sort_by?: string;
    order?: string;
  }): Promise<SuperAdminUserListResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', params.page.toString());
    queryParams.append('limit', params.limit.toString());
    if (params.search)
      queryParams.append('search', params.search);
    if (params.status && params.status !== 'all')
      queryParams.append('status', params.status);
    if (params.is_active !== undefined)
      queryParams.append('is_active', params.is_active.toString());
    if (params.is_verified_email !== undefined)
      queryParams.append('is_verified_email', params.is_verified_email.toString());
    if (params.is_verified_contact_number !== undefined)
      queryParams.append('is_verified_contact_number', params.is_verified_contact_number.toString());
    if (params.sort_by)
      queryParams.append('sort_by', params.sort_by);
    if (params.order)
      queryParams.append('order', params.order);

    return api.get(`${USER_ENDPOINT.BASE}user-list?${queryParams.toString()}`);
  },
  updateUserStatus: (params: {
    user_ids: number[];
    status: string;
  }): Promise<{
    status: string;
    message: string;
    data: {
      updated_count: number;
      updated_ids: number[];
      skipped_ids: number[];
    };
  }> => {
    return api.patch(`${USER_ENDPOINT.BASE}update-status`, params);
  },
  getOnchainVerifications: (params: {
    page: number;
    limit: number;
    search?: string;
    onchain_status?: string;
  }): Promise<OnchainVerificationResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', params.page.toString());
    queryParams.append('limit', params.limit.toString());
    if (params.search)
      queryParams.append('search', params.search);
    if (params.onchain_status && params.onchain_status !== 'all')
      queryParams.append('onchain_status', params.onchain_status);

    return api.get(`${ORGANIZATION_ENDPOINT.BASE}/onchain-verifications?${queryParams.toString()}`);
  },
};
