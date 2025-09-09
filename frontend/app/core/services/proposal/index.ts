import type { GetAllProposalResponse, ProposalCancelPayload, ProposalCreatePayload, ProposalExecutePayload } from './types';
import { api } from '@/core/api/client';
import { PROPOSAL_ENDPOINT } from '@/core/api/endpoints';

export const proposalApis = {
  getAllProposals: (queryParams: any) => api.get<GetAllProposalResponse>(`${PROPOSAL_ENDPOINT.BASE}`, { queryParams }),
  executeProposal: (payload: ProposalExecutePayload) => api.post(`${PROPOSAL_ENDPOINT.BASE}/execute`, payload),
  cancelProposal: (payload: ProposalCancelPayload) => api.post(`${PROPOSAL_ENDPOINT.BASE}/cancel`, payload),
  createProposal: (payload: ProposalCreatePayload) => api.post(`${PROPOSAL_ENDPOINT.BASE}`, payload),
};
