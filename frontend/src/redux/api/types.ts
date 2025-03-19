import { IOffchainProposalCard } from "@lib/interfaces";

// interfaces
interface Response {
  message: string;
  status: number;
}

// MFS
export type CreateMFSPayload = {
  name: string;
  email: string;
  context: string;
  type: string;
  location: string;
  wallet_address: string;
  native_currency: string;
  certificate: string;
};

export type CreateMFSResponse = CreateMFSPayload & {
  id: number;
  is_approved: boolean;
  trx_hash: string | null;
};

export type UpdateMFSPayload = {
  id: number;
  name?: string;
  email?: string;
  context?: string;
  type?: string;
  location?: string;
  wallet_address?: string;
  native_currency?: string;
  certificate?: string;
  trx_hash?: string;
};

export type UpdateMFSResponse = UpdateMFSPayload;

export type Organization = {
  id: number;
  name: string;
  email: string;
  context: string;
  type: string;
  location: string;
  is_approved: boolean;
  wallet_address: string;
  native_currency: string;
  certificate: string;
  trx_hash: string | null;
  membership_onchain_status: string;
};

// Auth
export type FetchMeResponse = {
  created_at: string;
  updated_at: string;
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  organization: Organization | null;
  exchangeUser: null;
};

export type GetMFSBusinessResponse = {
  created_at: string;
  updated_at: string;
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  mfsBusiness: Organization | null;
  exchangeUser: null;
};

export type MFSBusiness = {
  created_at: string;
  updated_at: string;
  id: number;
  name: string;
  type: string;
  location: string;
  membership_onchain_status: string;
};

export type GetAllMFSBusinessResponse = {
  data: MFSBusiness[];
  total: number;
  page: string;
  limit: string;
  totalPages: number;
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
