// src/transactions/dto/list-transactions.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { TransactionConfirmationSource, TransactionStatus } from '../entities/transaction.entity';

export class ListTransactionsQueryDto {
  @ApiProperty({ required: false, default: 1 })
  page: number = 1;

  @ApiProperty({ required: false, default: 10 })
  limit: number = 10;

  @ApiProperty({ required: false, enum: TransactionStatus })
  status?: TransactionStatus;

  @ApiProperty({ required: false, enum: TransactionConfirmationSource })
  source?: TransactionConfirmationSource;
}