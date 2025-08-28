import type {
  CreateOrgPayload,
  CreateOrgResponse,
  GetAllOrgResponse,
  GetOrgResponse,
  UpdateOrgPayload,
  UpdateOrgResponse,
} from "@/core/services/org/types";
import { api } from "@/core/api/client";
import { ORGANIZATION_ENDPOINT } from "@/core/api/endpoints";

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
  }) =>
    api.get<GetAllOrgResponse>(`${ORGANIZATION_ENDPOINT.BASE}`, {
      queryParams,
    }),
};
