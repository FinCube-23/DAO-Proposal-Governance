import { ApiProperty } from '@nestjs/swagger';
import {
  TransactionConfirmationSource,
  TransactionStatus,
} from '../entities/transaction.entity';

export class TransactionDetailResponseDto {
  @ApiProperty({
    description: 'This is the primary key of our off-chain record.',
    example: '23',
    required: true,
  })
  id: number;

  @ApiProperty({
    description:
      'This is the transaction has received from the on-chain for further tracing.',
    example:
      '0x8e74c737179b2b0753c1a473d808fdde1f4c5d6e88994f6724a3f028fa9128e6',
    required: true,
  })
  trx_hash: string;

  @ApiProperty({
    description:
      'This is the transaction meta data which was received during the transaction confirmation.',
    example:
      "{\"__typename\":\"ProposalAdded\",\"transactionHash\":\"0x8e74c737179b2b0753c1a473d808fdde1f4c5d6e88994f6724a3f028fa9128e6\",\"id\":\"0x8e74c737179b2b0753c1a473d808fdde1f4c5d6e88994f6724a3f028fa9128e655000000\",\"proposalId\":\"45\",\"proposalType\":0,\"blockNumber\":\"7830274\",\"blockTimestamp\":\"1741083168\",\"eventType\":\"proposalAddeds\"}",
    required: true,
  })
  metaData: string;

  @ApiProperty({
    description: "Transaction acknowledgement was not received from the on-chain the default value will be pending / 0 and if confirmed it will be 1",
    enum: TransactionStatus,
    example: TransactionStatus.CONFIRMED,
    required: true
  })
  trx_status: TransactionStatus;

  @ApiProperty({
    description: "This field ensure the transaction acknowledgement source.",
    enum: TransactionConfirmationSource,
    example: TransactionConfirmationSource.ALCHEMY,
    required: true
  })
  source: TransactionConfirmationSource;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty()
  created_at: Date;
}
