// src/transactions/dto/transaction-list-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  TransactionConfirmationSource,
  TransactionStatus,
} from '../../shared/common/entity/transaction.entity';

export class TransactionListItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  trx_hash: string;

  @ApiProperty({ enum: TransactionStatus })
  trx_status: TransactionStatus;

  @ApiProperty({ enum: TransactionConfirmationSource })
  confirmation_source: TransactionConfirmationSource;

  @ApiProperty({
    description:
      'Tracks which services have been synchronized for this transaction confirmation',
    example: [
      {
        service: 'DAO Service',
        status: 'completed',
        timestamp: '2025-10-08T10:30:00Z',
      },
      {
        service: 'UMS Service',
        status: 'completed',
        timestamp: '2025-10-08T10:30:15Z',
      },
    ],
    required: false,
  })
  transaction_confirmation_trace: Array<{
    service: string;
    status: 'completed' | 'failed';
    timestamp: string;
  }>;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty({
    description: 'wallet address that initiated the transaction',
  })
  from: string;

  @ApiProperty({
    description: 'Gas cost from trx_receipt converted to ETH',
  })
  gas_cost: number;

  @ApiProperty({
    description: 'trx_metadata as a JSON string',
  })
  event_logs: string;

  @ApiProperty({
    description: '__typename extracted from trx_metadata',
  })
  function: string;
}

export class TransactionListResponseDto {
  @ApiProperty({ type: [TransactionListItemDto] })
  data: TransactionListItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
