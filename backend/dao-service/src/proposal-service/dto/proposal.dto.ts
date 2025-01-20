import { ApiProperty } from '@nestjs/swagger';
import { EventMessageDto } from 'src/shared/common/dto/event-message.dto';
import { ResponseTransactionStatusDto } from 'src/shared/common/dto/response-transaction-status.dto';
import { TraceContextDto } from 'src/shared/common/dto/trace-context.dto';
import { ProposalStatus, ProposalType } from '../entities/proposal.entity';

export class ProposalCoreDto {

  @ApiProperty({
      description: "There are two types of proposals in our DAO. One is adding new member through major existing member's concent. Another one is proposing new currency.",
      enum: ProposalType,
      example: ProposalType.MEMBERSHIP,
      required: true
  })
  proposal_type: ProposalType;

  @ApiProperty()
  metadata: string;

  @ApiProperty({
      description: "Before placing each proposal at on-chain the transaction needs to get signed by the proposer wallet. This field will take the signer address as input.",
      example: "0xBb85D1852E67D6BEaa64A7eDba802189F0714F97",
      required: true
  })
  proposer_address: string;

  @ApiProperty({
      description: "This field only hold the transaction hash when the proposal is placed.",
      example: "0xe53c868443504e899c093736281f99a9d0b99d66a7b2ecd53575209fe69a8d2a",
      required: true
  })
  trx_hash: string;

}

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
  proposer_address: string;
}

export class MessageEnvelopeDto {
  trace_context: TraceContextDto;
  payload: PendingTransactionDto;
}

