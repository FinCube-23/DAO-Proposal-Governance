import { WEB3STATUS, web3StatusCode } from 'src/shared/common/constants';
import { ResponseTransactionStatusDto } from 'src/shared/common/dto/response-transaction-status.dto';

export class ProposalUpdateDto {

    public id: string;
    public proposalAddress: string;
    proposer_address: string;
    metadata: string;
    transaction_info: ResponseTransactionStatusDto;
    external_proposal: boolean;
  
  }
  
  