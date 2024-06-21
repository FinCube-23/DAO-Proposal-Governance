import { WEB3STATUS, web3StatusCode } from 'src/shared/common/constants';
import { ResponseTransactionStatusDto } from 'src/shared/common/dto/response-transaction-status.dto';

export class ProposalDto {

    public id: string;
    public proposalAddress: string;
   
  
  }
//A superclass will have the fields common to all DTOs. The child classes will deal with specifics
class CreatedProposalDto extends ProposalDto{
  proposer_address: string;
  metadata: string;
  transaction_info: ResponseTransactionStatusDto;
  external_proposal: boolean;

}


class UpdatedProposalDto extends ProposalDto{
  transaction_info: ResponseTransactionStatusDto;
  
}

  
  