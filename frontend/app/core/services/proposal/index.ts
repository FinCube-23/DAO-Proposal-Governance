import type {
  GetAllProposalResponse,
  IOffchainProposal,
  ProposalCreatePayload,
  ProposalOnchainVerificationPayload,
  ProposalOnchainVerificationResponse,
  ProposalOperationPayload,
} from './types';
import { api } from '@/core/api/client';
import { ORGANIZATION_ENDPOINT, PROPOSAL_ENDPOINT } from '@/core/api/endpoints';

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
  createOnchainVerification: (payload: ProposalOnchainVerificationPayload) =>
    api.post<ProposalOnchainVerificationResponse>(
      `${ORGANIZATION_ENDPOINT.BASE}/onchain-verifications`,
      payload
    ),
};
