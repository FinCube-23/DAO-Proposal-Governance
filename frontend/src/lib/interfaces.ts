export interface IOffchainProposalCard {
  id: number;
  proposal_type: string;
  proposer_address: string;
  proposal_status: string;
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

export interface IProposal {
  executed: boolean;
  canceled: boolean;
  proposer: string;
  data: string;
  target: string;
  voteStart: number;
  voteDuration: number;
  yesvotes: number;
  novotes: number;
  proposalURI: string;
}

export interface IDaoInfo {
  "@context": string;
  name: string;
  description: string;
  membersURI: string;
  proposalsURI: string;
  activityLogURI: string;
  governanceURI: string;
  contractsURI: string;
}
