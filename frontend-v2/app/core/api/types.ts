import { type IOffchainProposalCard } from "./interfaces";

// interfaces
interface Response {
  message: string;
  status: number;
}



export type Transaction = {
  id: number;
  trx_hash: string;
  trx_status: boolean;
  confirmation_source: string;
  updated_at: string;
};

export type GetTrxResponse = {
  data: Transaction[];
  total: number;
  page: string;
  limit: string;
  totalPages: number;
};

export type GetOneTrxResponse = {
  id: string;
  trx_hash: string;
  trx_status: boolean;
  source: string;
  metaData: string;
  created_at: string;
  updated_at: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: string;
};

export type RegisterResponse = {
  data: {
    message: string;
  };
};

// DAO
export type CreateDAOPayload = {
  id: number;
  name: string;
  token_name: string;
  token_address: string;
  royalty_amount: number;
  address: string;
  proposal_ID: [];
  proposal_metadata: [];
};

export type CreateDAOResponse = Response;

export type GetDAOResponse = CreateDAOPayload & Response;

// Proposal
export type CreateProposalPayload = {
  proposal_type: string;
  metadata: string;
  proposer_address: string;
  trx_hash: string;
};

export type GetOffchainProposalResponse = {
  data: IOffchainProposalCard[];
  limit: number;
  page: number;
  total: number;
};

export type CreateProposalResponse = CreateProposalPayload;

export type GetProposalResponse = CreateProposalPayload & Response;

// proxy (needs refactoring)
export type GetBalanceResponse = Response;

export type GetProposalThresholdResponse = Response;

export type GetProposalCountResponse = Response;

export type GetOngoingProposalsResponse = Response;

export type RegisterMemberPayload = {
  id: number;
  name: string;
};

export type RegisterMemberResponse = Response;

export type ExecuteProposalResponse = Response;

export type GetStatusByEmailResponse = { id: number; email: string; membership_onchain_status: string }
