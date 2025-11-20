import type {
  GetAllProposalResponse,
  IOffchainProposal,
  ProposalCreatePayload,
  ProposalOperationPayload,
} from './types';
import { api } from '@/core/api/client';
import { PROPOSAL_ENDPOINT } from '@/core/api/endpoints';

export const proposalApis = {
  getAllProposals: (queryParams: any) =>
    api.get<GetAllProposalResponse>(`${PROPOSAL_ENDPOINT.BASE}`, {
      queryParams,
    }),
  executeProposal: (payload: ProposalOperationPayload) =>
    api.patch(`${PROPOSAL_ENDPOINT.BASE}/execute-proposal`, payload),
  cancelProposal: (payload: ProposalOperationPayload) =>
    api.patch(`${PROPOSAL_ENDPOINT.BASE}/cancel-proposal`, payload),
  createProposal: (payload: ProposalCreatePayload) =>
    api.post(`${PROPOSAL_ENDPOINT.BASE}`, payload),
  getProposalById: (id: number) =>
    api.get<IOffchainProposal>(`${PROPOSAL_ENDPOINT.BASE}/${id}`),
};
