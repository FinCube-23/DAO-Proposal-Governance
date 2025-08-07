import type { CreateOrgPayload, CreateOrgResponse, GetAllOrgResponse, GetOrgResponse, UpdateOrgPayload, UpdateOrgResponse } from '@/core/services/org/types';
import { api } from '@/core/api/client';
import { MFS_ENDPOINT } from '@/core/api/endpoints';

export const orgApis = {
  getOrg: (orgId: string | number) => api.get<GetOrgResponse>(`${MFS_ENDPOINT.BASE}/${orgId}`),
  createOrg: (payload: CreateOrgPayload) => api.post<CreateOrgResponse>(`${MFS_ENDPOINT.BASE}`, payload),
  updateOrg: ({ id, ...form }: UpdateOrgPayload) => api.put<UpdateOrgResponse>(`${MFS_ENDPOINT.BASE}/${id}`, form),
  deleteOrg: (orgId: string | number) => api.delete(`${MFS_ENDPOINT.BASE}/${orgId}`),
  getAllOrgs: (queryParams: any) => api.get<GetAllOrgResponse>(`${MFS_ENDPOINT.BASE}`, { queryParams }),
};
