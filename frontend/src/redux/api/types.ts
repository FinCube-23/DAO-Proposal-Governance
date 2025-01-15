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
  is_approved: boolean;
  wallet_address: string;
  native_currency: string;
  certificate: string;
};

export type CreateMFSResponse = CreateMFSPayload & {
  id: number;
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
  mfsBusiness: null;
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
  id: number;
  proposal_address: string;
  metadata: string;
  trx_hash: string;
  proposal_status: unknown;
  external_proposal: boolean;
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
