export type OnchainStatus = 'pending' | 'approved' | 'cancelled' | 'banned';

export type DateFilterOption = 'any' | 'today' | 'past_7_days' | 'this_month' | 'this_year';

export interface OnchainVerificationFilters {
  onchain_status: 'all' | OnchainStatus;
  created_at: DateFilterOption;
  search: string;
}

export interface OnchainVerification {
  id: number;
  trx_hash: string;
  onchain_id: number | null;
  onchain_status: string;
  proposer_wallet: string;
  context: {
    __typename: string;
    description: string;
    proposalType: string;
    organizationId: number;
  };
  organization_name: string;
  created_at: string;
  updated_at: string;
}

export interface OnchainVerificationResponse {
  verifications: OnchainVerification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
