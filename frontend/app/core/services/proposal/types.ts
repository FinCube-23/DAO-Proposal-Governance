export interface IOffchainProposalCard {
  id: number;
  proposal_type: string;
  proposer_address: string;
  proposal_status: string;
  metadata: string;
}

export interface GetAllProposalResponse {
  data: IOffchainProposalCard[];
  limit: number;
  page: number;
  total: number;
}

export interface ProposalOperationPayload {
  proposalId: number;
  onChainData: {
    transactionHash: string;
    signedBy: string;
    signedWith: string;
    chainId: number;
    context: object;
  };
}

export interface ProposalCreatePayload {
  proposal_type: string;
  onChainData: {
    transactionHash: string;
    signedBy: string;
    signedWith: string;
    chainId: string;
    context: object;
  };
}

export interface GetOffchainProposalResponse {
  data: IOffchainProposalCard[];
  limit: number;
  page: number;
  total: number;
}

export interface IOffchainProposal {
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
}

export interface ProposalOnchainVerificationPayload {
  trx_hash: string;
  context: string;
  proposer_wallet: string;
  organization_id: number | null;
}

export interface ProposalOnchainVerificationResponse {
  id: number;
  trx_hash: string;
  context: string;
  proposer_wallet: string;
  organization_id: number;
  created_at: string;
}
