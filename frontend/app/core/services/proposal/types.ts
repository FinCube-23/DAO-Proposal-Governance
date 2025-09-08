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
