import type { ExecuteProposalResponse, GetOngoingProposalsResponse, GetProposalThresholdResponse, RegisterMemberResponse } from './types';
import { api } from '@/core/api/client';
import { PROXY_ENDPOINT } from '@/core/api/endpoints';

export const proxyApis = {
  checkIsMemberApproved: (payload: { address: string }) =>
    api.post<boolean>(`${PROXY_ENDPOINT.BASE}/is-member-approved`, payload),

  getBalance: (payload: { address: string }) =>
    api.post<any>(`${PROXY_ENDPOINT.BASE}/balance`, payload),

  getProposalThreshold: () =>
    api.get<GetProposalThresholdResponse>(`${PROXY_ENDPOINT.BASE}/proposal-threshold`),

  getProposalCount: () =>
    api.get<number>(`${PROXY_ENDPOINT.BASE}/proposal-count`),

  getOngoingProposals: () =>
    api.get<GetOngoingProposalsResponse>(`${PROXY_ENDPOINT.BASE}/ongoing-proposals`),

  registerMember: (payload: any) =>
    api.post<RegisterMemberResponse>(`${PROXY_ENDPOINT.BASE}/register-member`, payload),

  executeProposal: () =>
    api.post<ExecuteProposalResponse>(`${PROXY_ENDPOINT.BASE}/execute-proposal`),
};
