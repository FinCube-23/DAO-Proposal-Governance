import { EventMessageDto } from 'src/shared/common/dto/event-message.dto';
import { ResponseTransactionStatusDto } from 'src/shared/common/dto/response-transaction-status.dto';
import { TraceContextDto } from 'src/shared/common/dto/trace-context.dto';

export class ProposalDto {
  public id: string;
  public proposalId: string;
}

//A superclass will have the fields common to all DTOs. The child classes will deal with specifics
export class CreatedProposalDto extends ProposalDto {
  proposer_address: string;
  description: string;
  voteStart: string;
  voteEnd: string;
  transaction_data: ResponseTransactionStatusDto;
  external_proposal: boolean;
}

export class ProposeEnvelopeDto {
  event_data: EventMessageDto;
  trace_context: TraceContextDto;
  payload: CreatedProposalDto;
}

export class ExecuteEnvelopeDto {
  event_data: EventMessageDto;
  trace_context: TraceContextDto;
  payload: ProposalDto;
}

export class PendingTransactionDto {
  trx_hash: string;
  trx_singer: string;
}

export class MessageEnvelopeDto {
  trace_context: TraceContextDto;
  payload: PendingTransactionDto;
}

