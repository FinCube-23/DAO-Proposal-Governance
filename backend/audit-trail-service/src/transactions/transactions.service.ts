import {
  TransactionConfirmationSource,
  TransactionEntity,
  TransactionStatus,
} from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ListTransactionsQueryDto } from './dto/list-transactions.dto';
import { TransactionListResponseDto } from './dto/transaction-list-response.dto';
import { TransactionDetailResponseDto } from './dto/transaction-detail.dto';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
  ) {}

  async create(
    transactionPacket: Partial<TransactionEntity>,
  ): Promise<TransactionEntity> {
    try {
      const new_transaction =
        this.transactionRepository.create(transactionPacket);
      this.logger.log(
        `New transaction initialized at Audit Trail DB, where transaction hash: ${new_transaction.trx_hash}`,
      );
      return this.transactionRepository.save(new_transaction);
    } catch (err) {
      this.logger.error(
        `Transaction couldn't logged in Web2 DB where transaction hash is ${transactionPacket.trx_hash}. Error: ${err}`,
      );
      throw new Error("Transaction couldn't logged in Web2 DB.");
    }
  }

  async findAll(
    query: ListTransactionsQueryDto,
  ): Promise<TransactionListResponseDto> {
    const { page = 1, limit = 10, status, source } = query;
    const skip = (page - 1) * limit;

    const queryBuilder =
      this.transactionRepository.createQueryBuilder('transaction');

    // Apply filters if provided
    if (status !== undefined) {
      queryBuilder.andWhere('transaction.trx_status = :status', { status });
    }

    if (source) {
      queryBuilder.andWhere('transaction.confirmation_source = :source', {
        source,
      });
    }

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder
      .select([
        'transaction.id',
        'transaction.trx_hash',
        'transaction.trx_status',
        'transaction.confirmation_source',
        'transaction.updated_at',
      ])
      .skip(skip)
      .take(limit)
      .orderBy('transaction.created_at', 'DESC');

    const transactions = await queryBuilder.getMany();
    const totalPages = Math.ceil(total / limit);

    return {
      data: transactions,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(id: number): Promise<TransactionDetailResponseDto> {
    let transaction: TransactionEntity;
    transaction = await this.transactionRepository.findOne({
      where: { id: id },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return {
      id: transaction.id,
      trx_hash: transaction.trx_hash,
      trx_status: transaction.trx_status,
      source: transaction.confirmation_source,
      metaData: transaction.trx_metadata,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
    };
  }

  async findByHash(hash: string): Promise<TransactionDetailResponseDto> {
    let transaction: TransactionEntity;
    transaction = await this.transactionRepository.findOne({
      where: { trx_hash: hash },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return {
      id: transaction.id,
      trx_hash: transaction.trx_hash,
      trx_status: transaction.trx_status,
      source: transaction.confirmation_source,
      metaData: transaction.trx_metadata,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
    };
  }

  async updateStatus(
    trxHash: string,
    metadata: string,
    source: TransactionConfirmationSource,
    newStatus: number,
  ): Promise<TransactionEntity> {
    try {
      const transaction = await this.transactionRepository.findOne({
        where: { trx_hash: trxHash },
      });

      if (!transaction) {
        this.logger.warn(
          'Transaction is an off-system transaction, not found in DB',
        );
        return null;
      }
      this.logger.log(
        `Transaction status found! Getting updated at Audit Trail DB at PK: ${transaction.id} where transaction status is: ${transaction.trx_status}.`,
      );

      transaction.trx_status = newStatus as TransactionStatus;
      transaction.trx_metadata = metadata;
      transaction.confirmation_source = source;
      this.logger.log(
        `Transaction status updating at PK: ${transaction.id} where transaction status is: ${transaction.trx_status} and Source: ${transaction.confirmation_source}.`,
      );
      return await this.transactionRepository.save(transaction);
    } catch (err) {
      this.logger.error(
        `Transaction status couldn't get updated for transaction hash: ${trxHash}. Error: ${err}`,
      );
      throw new Error("Transaction status couldn't get updated.");
    }
  }

  async getPendingTransactionHash(): Promise<string[]> {
    try {
      const transactions = await this.transactionRepository.find({
        where: {
          trx_status: TransactionStatus.PENDING,
        },
      });
      return transactions.map((transaction) => transaction.trx_hash);
    } catch {
      this.logger.error('Could not find any pending transactions');
      return [];
    }
  }
}
