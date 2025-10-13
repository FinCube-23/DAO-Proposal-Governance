import type { UserOrgs } from '../services/org/types';
import type { IOffchainProposalCard } from './interfaces';

// enums
export enum TransactionConfirmationSource {
  ALCHEMY = 'alchemy',
  INFURA = 'infura',
  THE_GRAPH = 'graph',
  MANUAL = 'manual',
  PENDING_SOURCE = 'pending_source',
}

// interfaces
export interface Response {
  message: string;
  status: number;
}

export interface Transaction {
  id: number;
  trx_hash: string;
  trx_status: boolean;
  confirmation_source: TransactionConfirmationSource;
  updated_at: string;
  from_address?: string;
  to_address?: string;
  function_name?: string;
  effective_fee_raw?: string;
  top_event?: string;
  transaction_confirmation_trace?: Array<{
    status: 'completed' | 'pending' | 'failed' | 'waiting';
    service: string;
    timestamp: string;
  }>;
  event_logs?: Array<{
    event_name: string;
    contract_address: string;
    topics: string[];
    data: string;
    block_number: number;
    log_index: number;
  }>;
}

export interface GetTrxResponse {
  data: Transaction[];
  total: number;
  page: string;
  limit: string;
  totalPages: number;
}

export interface GetOneTrxResponse {
  id: string;
  trx_hash: string;
  trx_status: boolean;
  source: string;
  metaData: string;
  created_at: string;
  updated_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  tokens: {
    refresh: string;
    access: string;
  };
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  password: string;
  password_confirm: string;
}

export interface RegisterResponse {
  data: {
    message: string;
  };
}

export interface Organization {
  id: number;
  name: string;
  is_admin: boolean;
}

export interface FetchMeResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  contact_number: string;
  is_active: boolean;
  is_staff: boolean;
  status: string;
  organizations: UserOrgs[];
}

// Membership approval check
export interface IsMemberApprovedPayload {
  address: string;
}

export type IsMemberApprovedResponse = boolean;

// DAO
export interface CreateDAOPayload {
  id: number;
  name: string;
  token_name: string;
  token_address: string;
  royalty_amount: number;
  address: string;
  proposal_ID: [];
  proposal_metadata: [];
}

export type CreateDAOResponse = Response;

export type GetDAOResponse = CreateDAOPayload & Response;

// Proposal
export interface CreateProposalPayload {
  proposal_type: string;
  metadata: string;
  proposer_address: string;
  trx_hash: string;
}

export interface GetOffchainProposalResponse {
  data: IOffchainProposalCard[];
  limit: number;
  page: number;
  total: number;
}

export type CreateProposalResponse = CreateProposalPayload;

export type GetProposalResponse = CreateProposalPayload & Response;

// proxy (needs refactoring)
export type GetBalanceResponse = Response;

export type GetProposalThresholdResponse = Response;

export type GetProposalCountResponse = Response;

export type GetOngoingProposalsResponse = Response;

export interface RegisterMemberPayload {
  id: number;
  name: string;
}

export type RegisterMemberResponse = Response;

export type ExecuteProposalResponse = Response;

export interface GetStatusByEmailResponse {
  id: number;
  email: string;
  membership_onchain_status: string;
}
