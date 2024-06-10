import { ResponseTransactionStatusDto } from 'src/shared/common/dto/response-transaction-status.dto';

export class ProposalDto {

  public id: string;
  public proposalAddress: string;
  proposer_address: string;
  metadata: string;
  transaction_info: ResponseTransactionStatusDto;
  external_proposal: boolean;

}

