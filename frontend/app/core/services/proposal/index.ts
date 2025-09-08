import type { GetAllProposalResponse } from './types';
import { api } from '@/core/api/client';
import { PROPOSAL_ENDPOINT } from '@/core/api/endpoints';

export const proposalApis = {
  getAllProposals: (queryParams: any) => api.get<GetAllProposalResponse>(`${PROPOSAL_ENDPOINT.BASE}`, { queryParams }),
};
