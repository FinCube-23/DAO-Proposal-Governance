// interfaces
interface Response {
  message: string;
  status: number;
}

// MFS
export type CreateMFSPayload = {
  name: string;
  org_email: string;
  wallet_address?: string;
  native_currency?: string;
  certificate?: string;
  dao_id?: number;
  user_id: number;
};

export type CreateMFSResponse = CreateMFSPayload & {
  id: number;
};

// Auth
export type AuthMeResponse = {
  id: number;
  sub: string;
  role: string;
  mfs: unknown;
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
  proposal_status: boolean;
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
