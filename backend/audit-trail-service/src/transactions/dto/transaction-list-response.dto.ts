// src/transactions/dto/transaction-list-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { TransactionConfirmationSource, TransactionStatus } from '../entities/transaction.entity';

export class TransactionListItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  trx_hash: string;

  @ApiProperty({ enum: TransactionStatus })
  trx_status: TransactionStatus;

  @ApiProperty({ enum: TransactionConfirmationSource })
  confirmation_source: TransactionConfirmationSource;

  @ApiProperty()
  updated_at: Date;
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