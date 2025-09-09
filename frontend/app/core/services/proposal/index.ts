import type { GetAllProposalResponse, ProposalCancelPayload, ProposalExecutePayload } from './types';
import { api } from '@/core/api/client';
import { PROPOSAL_ENDPOINT } from '@/core/api/endpoints';

export const proposalApis = {
  getAllProposals: (queryParams: any) => api.get<GetAllProposalResponse>(`${PROPOSAL_ENDPOINT.BASE}`, { queryParams }),
  executeProposal: (payload: ProposalExecutePayload) => api.post(`${PROPOSAL_ENDPOINT.BASE}/execute`, payload),
  cancelProposal: (payload: ProposalCancelPayload) => api.post(`${PROPOSAL_ENDPOINT.BASE}/cancel`, payload),
};
