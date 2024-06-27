import { ResponseTransactionStatusDto } from 'src/shared/common/dto/response-transaction-status.dto';

export class ProposalDto {

  public id: string;
  public proposalAddress: string;
 

}
//A superclass will have the fields common to all DTOs. The child classes will deal with specifics
export class CreatedProposalDto extends ProposalDto{
proposer_address: string;
metadata: string;
transaction_info: ResponseTransactionStatusDto;
external_proposal: boolean;

}


export class UpdatedProposalDto extends ProposalDto{
transaction_info: ResponseTransactionStatusDto;

}


