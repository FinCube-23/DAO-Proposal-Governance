import { ApiProperty } from '@nestjs/swagger';
import { EventMessageDto } from 'src/shared/common/dto/event-message.dto';
import { ResponseTransactionStatusDto } from 'src/shared/common/dto/response-transaction-status.dto';
import { TraceContextDto } from 'src/shared/common/dto/trace-context.dto';
import { ProposalStatus, ProposalType } from '../entities/proposal.entity';

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


