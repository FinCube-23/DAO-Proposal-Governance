import type { IsMemberApprovedPayload, IsMemberApprovedResponse } from '@/core/api/types';
import { api } from '@/core/api/client';
import { PROXY_ENDPOINT } from '@/core/api/endpoints';

export const membershipApis = {
  checkMemberApproval: (payload: IsMemberApprovedPayload) =>
    api.post<IsMemberApprovedResponse>(`${PROXY_ENDPOINT.BASE}/is-member-approved`, payload),
};
