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

export type MFSBusiness = {
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
  mfsBusiness: MFSBusiness | null;
  exchangeUser: null;
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
  proposal_onchain_id: number;
  proposal_type: string;
  metadata: string;
  proposer_address: string;
  proposal_executed_by: string;
  external_proposal: boolean;
  proposal_status: string;
  trx_hash: string;
  trx_status: number;
};

export type GetOffchainProposalResponse = {
  id: number;
  proposal_onchain_id: number;
  proposal_type: string;
  metadata: string;
  proposer_address: string;
  processed_by: string;
  proposal_status: string;
  trx_hash: string;
  audit_id: number;
  trx_status: number;
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
