import {
  TransactionConfirmationSource,
  TransactionEntity,
  TransactionStatus,
} from '../shared/common/entity/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Not, IsNull, Repository } from 'typeorm';
import { ListTransactionsQueryDto } from './dto/list-transactions.dto';
import { TransactionListResponseDto } from './dto/transaction-list-response.dto';
import { TransactionDetailResponseDto } from './dto/transaction-detail.dto';
import { WinstonLogger } from 'src/shared/common/logger/winston-logger';
import { TraceContextService } from 'src/shared/common/tracing/trace-context.service';
import { TempoService } from '../shared/common/tracing/tempo.service';
import { TransactionReceiptEventDto } from 'src/shared/common/dto/transaction-receipt-event.dto';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class TransactionGatewayService {
  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
    private readonly logger: WinstonLogger,
    private readonly traceContextService: TraceContextService,
    private readonly tempoService: TempoService,
  ) {
    this.logger.setContext(TransactionGatewayService.name);
  }

  @RabbitSubscribe({
    exchange: 'exchange.transaction-receipt.fanout',
    routingKey: '',
    queue: 'audit-trail-transaction-receipt-queue',
    queueOptions: {
      durable: true,
    },
  })
  async handleTransactionReceipt(event: TransactionReceiptEventDto) {
    this.logger.log(
      'Got a new transaction hash ' + event.onChainData?.transactionHash,
    );
    try {
      const new_dao_audit = {
        trx_hash: event.onChainData?.transactionHash,
        trx_sender: event.onChainData?.signedBy,
        trx_status: 0,
      };
      const dbRecordedTRX = this.transactionRepository.create(new_dao_audit);
      this.logger.log(
        `New transaction initialized at Audit Trail DB, where transaction hash: ${dbRecordedTRX.trx_hash}`,
      );
      const savedTransaction =
        await this.transactionRepository.save(dbRecordedTRX);

      this.logger.log(`Recorded transaction ID: ${savedTransaction.id} in DB`);
      this.logger.log('✅ Transaction receipt processing complete');
    } catch (error) {
      this.logger.error(
        `Transaction couldn't be logged in DB where transaction hash is ${event.onChainData?.transactionHash}. Error: ${error.message}`,
        error.stack,
      );
      throw new Error("Transaction couldn't be logged in Web2 DB.");
    }
  }

  async findAll(
    query: ListTransactionsQueryDto,
  ): Promise<TransactionListResponseDto> {
    const { page = 1, limit = 10, status, source, hash } = query;
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

    if (hash) {
      queryBuilder.andWhere('transaction.trx_hash = :hash', { hash });
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
        'transaction.transaction_confirmation_trace',
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
      transaction_confirmation_trace:
        transaction.transaction_confirmation_trace,
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
      transaction_confirmation_trace:
        transaction.transaction_confirmation_trace,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
    };
  }

  async getStatistics(): Promise<any> {
    const totalTransactions = await this.transactionRepository.count();

    const pendingTransactions = await this.transactionRepository.count({
      where: { trx_status: TransactionStatus.PENDING },
    });

    const confirmedTransactions = await this.transactionRepository.count({
      where: { trx_status: TransactionStatus.CONFIRMED },
    });

    const unsyncedTransactions = await this.transactionRepository.count({
      where: { transaction_confirmation_trace: IsNull() },
    });

    const syncedTransactions = totalTransactions - unsyncedTransactions;
    const syncRate =
      totalTransactions === 0
        ? 0
        : (syncedTransactions / totalTransactions) * 100;

    const totalLiquidityResult = 100000;

    const confirmationSourceBreakdown = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('transaction.confirmation_source', 'source')
      .addSelect('COUNT(*)', 'count')
      .groupBy('transaction.confirmation_source')
      .getRawMany();

    const breakdown = {};
    confirmationSourceBreakdown.forEach((item) => {
      breakdown[item.source] = parseInt(item.count, 10);
    });

    const confirmedTxWithTimes = await this.transactionRepository.find({
      where: { trx_status: TransactionStatus.CONFIRMED },
      select: ['created_at', 'updated_at'],
    });

    let averageConfirmationTime = null;
    if (confirmedTxWithTimes.length > 0) {
      const totalMilliseconds = confirmedTxWithTimes.reduce((sum, tx) => {
        const createdAt = new Date(tx.created_at).getTime();
        const updatedAt = new Date(tx.updated_at).getTime();
        return sum + (updatedAt - createdAt);
      }, 0);
      averageConfirmationTime = totalMilliseconds / confirmedTxWithTimes.length;
    }

    return {
      totalTransactions,
      pendingTransactions,
      confirmedTransactions,
      syncRate: parseFloat(syncRate.toFixed(2)),
      totalLiquidity: totalLiquidityResult.toString(),
      confirmationSourceBreakdown: breakdown,
      averageConfirmationTime: averageConfirmationTime || 'N/A',
    };
  }

  async getTransactionHashForTraceSync(): Promise<string[]> {
    this.logger.log('Fetching transactions for trace synchronization.');
    try {
      const transactions = await this.transactionRepository.find({
        where: {
          transaction_confirmation_trace: IsNull(),
          confirmation_source: Not(
            TransactionConfirmationSource.PENDING_SOURCE,
          ),
          trx_status: TransactionStatus.CONFIRMED,
        },
        select: ['id', 'trx_hash'],
        take: 100,
      });
      this.logger.log(
        `Found ${transactions.length} transactions needing trace synchronization.`,
      );
      return transactions.map((transaction) => transaction.trx_hash);
    } catch (err) {
      this.logger.error(
        `Could not find any transactions for trace synchronization. Error: ${err}`,
      );
      return [];
    }
  }

  async getTraceIdByTransactionHash(trxHash: string): Promise<string | null> {
    this.logger.log(
      `Fetching trace ID from database for transaction hash: ${trxHash}`,
    );
    try {
      const transaction = await this.transactionRepository.findOne({
        where: { trx_hash: trxHash },
        select: ['trace_id'],
      });

      if (!transaction) {
        this.logger.warn(
          `Transaction with hash ${trxHash} not found in DB for trace ID retrieval.`,
        );
        return null;
      }

      return transaction.trace_id || null;
    } catch (error) {
      this.logger.error(
        `Error fetching trace ID for transaction hash ${trxHash}: ${error.message}`,
      );
      return null;
    }
  }

  async updateTransactionTrace(transactionHash: string, trace: any) {
    this.logger.log(`Updating transaction trace for hash: ${transactionHash}`);
    try {
      const transaction = await this.transactionRepository.findOne({
        where: { trx_hash: transactionHash },
      });

      if (!transaction) {
        this.logger.warn(
          `Transaction with hash ${transactionHash} not found in DB for trace update.`,
        );
        return;
      }

      // Update the transaction's trace information
      transaction.transaction_confirmation_trace = trace;
      await this.transactionRepository.save(transaction);

      this.logger.log(
        `Transaction trace updated successfully for hash: ${transactionHash}`,
      );
    } catch (error) {
      this.logger.error(
        `Error updating transaction trace for hash ${transactionHash}: ${error.message}`,
      );
    }
  }
}
