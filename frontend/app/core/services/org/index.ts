import type {
  AddUserToOrgPayload,
  AddUserToOrgResponse,
  CreateOrgPayload,
  CreateOrgResponse,
  GetAllOrgResponse,
  GetOrgResponse,
  OrgOnchainVerificationResponse,
  OrgUserListResponse,
  UpdateOrgPayload,
  UpdateOrgResponse,
} from '@/core/services/org/types';
import { api } from '@/core/api/client';
import { ORGANIZATION_ENDPOINT } from '@/core/api/endpoints';

export const orgApis = {
  getOrg: (orgId: string | number) =>
    api.get<GetOrgResponse>(`${ORGANIZATION_ENDPOINT.BASE}/${orgId}`),
  createOrg: (payload: CreateOrgPayload) =>
    api.post<CreateOrgResponse>(`${ORGANIZATION_ENDPOINT.BASE}`, payload),
  updateOrg: ({ id, ...form }: UpdateOrgPayload) =>
    api.put<UpdateOrgResponse>(`${ORGANIZATION_ENDPOINT.BASE}/${id}`, form),
  deleteOrg: (orgId: string | number) =>
    api.delete(`${ORGANIZATION_ENDPOINT.BASE}/${orgId}`),
  getAllOrgs: (queryParams?: {
    status?: string;
    page?: number;
    limit?: number;
    location?: string;
    type?: string;
  }) =>
    api.get<GetAllOrgResponse>(`${ORGANIZATION_ENDPOINT.BASE}`, {
      queryParams,
    }),
  getUsersByOrg: (
    orgId: number,
    queryParams?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      is_active?: boolean;
      is_verified_email?: boolean;
      is_verified_contact_number?: boolean;
      sort_by?: string;
      order?: 'asc' | 'desc';
    },
  ) =>
    api.get<OrgUserListResponse>(
      `${ORGANIZATION_ENDPOINT.BASE}/${orgId}/users`,
      { queryParams },
    ),
  getOnchainVerificationsByOrg: (
    orgId: number,
    queryParams?: {
      page?: number;
      limit?: number;
      search?: string;
      onchain_status?: string;
    },
  ) =>
    api.get<OrgOnchainVerificationResponse>(
      `${ORGANIZATION_ENDPOINT.BASE}/${orgId}/onchain-verifications`,
      { queryParams },
    ),
  addUserToOrg: (payload: AddUserToOrgPayload) =>
    api.post<AddUserToOrgResponse>(
      `${ORGANIZATION_ENDPOINT.BASE}/users`,
      payload,
    ),
};
