import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum TransactionConfirmationSource {
  ALCHEMY = 'alchemy',
  INFURA = 'infura',
  THE_GRAPH = 'graph',
  MANUAL = 'manual',
  PENDING_SOURCE = 'pending_source',
}

export enum TransactionStatus {
  PENDING = 0,
  CONFIRMED = 1,
}
export interface TransactionReceipt {
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  blockNumber: number;
  from: string;
  to: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  contractAddress: string | null;
  logs: any[];
  logsBloom: string;
  status: number;
  effectiveGasPrice?: string;
  type?: string;
}

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ type: 'varchar', unique: true })
  @ApiProperty()
  trx_hash: string;

  @Column({ type: 'varchar', nullable: true })
  @ApiProperty({
    description: 'The blockchain network chain ID',
    example: '11155111',
    required: false,
  })
  chain_id: string;

  @Column({
    type: 'enum',
    enum: TransactionConfirmationSource,
    default: TransactionConfirmationSource.PENDING_SOURCE,
    nullable: true,
  })
  confirmation_source: TransactionConfirmationSource;

  @Column({ type: 'varchar', nullable: true })
  @ApiProperty()
  trx_metadata: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  @ApiProperty({
    description:
      'This field will be automatically updated based on the proposal transaction status and after approval or cancellation and execution of the proposal on-chain',
    enum: TransactionStatus,
    example: TransactionStatus.PENDING,
    required: false,
  })
  trx_status: TransactionStatus;

  @CreateDateColumn({ name: 'created_at' }) 'created_at': Date;

  @UpdateDateColumn({ name: 'updated_at' }) 'updated_at': Date;

  @Column({ type: 'varchar', nullable: true })
  @ApiProperty({
    description:
      'A unique identifier to trace the transaction across different services and logs',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  trace_id: string;

  @Column({ type: 'jsonb', nullable: true })
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

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    description: 'Raw transaction data as stringified JSON',
    example:
      '{"hash":"0x123...","nonce":42,"gasPrice":"20000000000","gas":"21000","to":"0xabc...","value":"1000000000000000000","input":"0x","v":"0x1c","r":"0x456...","s":"0x789..."}',
    required: false,
  })
  raw_trx: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty({
    description: 'Complete transaction receipt from blockchain',
    example: {
      transactionHash:
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      transactionIndex: 5,
      blockHash:
        '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      blockNumber: 18500000,
      from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      to: '0xF15E6b68541AAe83bB96F61498812c3E0A35F09b',
      cumulativeGasUsed: '121000',
      gasUsed: '21000',
      contractAddress: null,
      logs: [],
      status: 1,
    },
    required: false,
  })
  trx_receipt: TransactionReceipt;
}
