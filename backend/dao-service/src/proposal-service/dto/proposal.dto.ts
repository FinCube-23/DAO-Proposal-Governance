import { ApiProperty } from '@nestjs/swagger';
import { ProposalStatus, ProposalType } from '../entities/proposal.entity';
import { EventMessageDto } from 'src/shared/common/dto/event-message.dto';
import { ResponseTransactionStatusDto } from 'src/shared/common/dto/response-transaction-status.dto';
import { TraceContextDto } from 'src/shared/common/dto/trace-context.dto';

export class ProposalListDto {
  @ApiProperty({
    description: "This is the primary key of our proposal in our off-chain database record",
    example: 27,
    required: true
  })
  id: number;

  @ApiProperty({
    description: "There are two types of proposals in our DAO. One is adding new member through major existing member's concent. Another one is proposing new currency.",
    enum: ProposalType,
    example: ProposalType.MEMBERSHIP,
    required: true
  })
  proposal_type: ProposalType;

  @ApiProperty({
    description: "Before placing each proposal at on-chain the transaction needs to get signed by the proposer wallet. This field will take the signer address as input.",
    example: "0xBb85D1852E67D6BEaa64A7eDba802189F0714F97",
    required: true
  })
  proposer_address: string;

  @ApiProperty({
    description: "This field will be automatically updated based on the proposal transaction status and after approval or cancellation and execution of the proposal on-chain",
    enum: ProposalStatus,
    example: ProposalStatus.PENDING,
    required: false
  })
  proposal_status: ProposalStatus;
}

export class PaginatedProposalResponse {
  @ApiProperty({ type: [ProposalListDto] })
  data: ProposalListDto[];

  @ApiProperty({
    description: "This field shows the total number of proposals we have in the off-chain database record",
    example: 10,
    required: true
  })
  total: number;

  @ApiProperty({
    description: "This field indicates the page number you want to receive. The default value is set as one.",
    example: 1,
    required: true
  })
  page: number;

  @ApiProperty({
    description: "This field indicates the number of proposals you want to receive in a page. The default value is set as ten.",
    example: 10,
    required: true
  })
  limit: number;
}

export class ProposalDto {

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

export class PendingTransactionDto {
  trx_hash: string;
  proposer_address: string;
}


