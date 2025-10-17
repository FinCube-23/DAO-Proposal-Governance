import {
  TransactionConfirmationSource,
  TransactionEntity,
  TransactionStatus,
} from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Not, IsNull, Repository } from 'typeorm';
import { ListTransactionsQueryDto } from './dto/list-transactions.dto';
import { TransactionListResponseDto } from './dto/transaction-list-response.dto';
import { TransactionDetailResponseDto } from './dto/transaction-detail.dto';
import { WinstonLogger } from 'src/shared/common/logger/winston-logger';
import { TraceContextService } from 'src/shared/common/tracing/trace-context.service';
import { TempoService } from '../shared/common/tracing/tempo.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
    private readonly logger: WinstonLogger,
    private readonly traceContextService: TraceContextService,
    private readonly tempoService: TempoService,
  ) {
    this.logger.setContext(TransactionsService.name);
  }

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
      transaction.transaction_confirmation_trace = null;

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

  async synchronizeTransactionTrace(transactionHash: string): Promise<void> {
    try {
      const transaction = await this.transactionRepository.findOne({
        where: { trx_hash: transactionHash },
      });

      if (!transaction) {
        this.logger.warn(
          `Transaction with hash ${transactionHash} not found in DB for trace synchronization.`,
        );
        return;
      }

      const traceContext = this.traceContextService.getCurrentTraceContext();
      const traceId = traceContext.trace_id;

      if (!traceId || traceId === 'N/A') {
        this.logger.warn(
          `No valid trace ID found for transaction ${transactionHash}. Skipping trace synchronization.`,
        );
        return;
      }

      this.logger.log(
        `Starting trace synchronization for transaction ${transactionHash} with trace ID: ${traceId}`,
      );

      const isTraceAvailable = await this.tempoService.waitForTraceAvailability(
        traceId,
        parseInt(process.env.TEMPO_RETRY_COUNT || '3'),
        parseInt(process.env.TEMPO_RETRY_DELAY_MS || '2000'),
      );

      if (!isTraceAvailable) {
        this.logger.warn(
          `Trace ${traceId} not available in Tempo after retries. Transaction: ${transactionHash}`,
        );
        return;
      }

      const serviceStatuses =
        await this.tempoService.extractServiceStatus(traceId);

      if (!serviceStatuses || serviceStatuses.length === 0) {
        this.logger.warn(
          `No service statuses extracted from trace ${traceId} for transaction ${transactionHash}`,
        );
        return;
      }

      transaction.transaction_confirmation_trace = serviceStatuses;

      await this.transactionRepository.save(transaction);

      this.logger.log(
        `Transaction trace synchronized successfully for ${transactionHash}. ` +
          `Services tracked: ${serviceStatuses
            .map((s) => `${s.service}(${s.status})`)
            .join(', ')}`,
      );
    } catch (err) {
      this.logger.error(
        `Error synchronizing trace for transaction hash ${transactionHash}: ${err.message}`,
      );
    }
  }

  async getLatestTraceIdFromLoki(trxHash: string): Promise<string | null> {
    try {
      if (!trxHash || !trxHash.startsWith('0x') || trxHash.length !== 66) {
        this.logger.error(`Invalid transaction hash format: ${trxHash}`);
        return null;
      }

      const lokiUrl = process.env.LOKI_URL || 'http://loki:3100';
      const now = Date.now();
      const startTime = now - 24 * 60 * 60 * 1000; // 24 hours back

      // Convert to nanoseconds (Loki uses nanosecond timestamps)
      const start = (startTime * 1_000_000).toString();
      const end = (now * 1_000_000).toString();

      // LogQL query to find logs containing the transaction hash
      const logQuery = `{service_name=~".+"} |= "${trxHash}" | json | line_format "{{.trace_id}}"`;

      const queryParams = new URLSearchParams({
        query: logQuery,
        start: start,
        end: end,
        direction: 'backward', // Get most recent first
        limit: '50',
      });

      const url = `${lokiUrl}/loki/api/v1/query_range?${queryParams}`;

      this.logger.log(
        `Querying Loki for trace ID with transaction hash: ${trxHash}`,
      );

      // Use native fetch or axios if available in your service
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        this.logger.error(`Loki query failed with status: ${response.status}`);
        return null;
      }

      const data = await response.json();

      if (data.status !== 'success') {
        this.logger.error(`Loki query failed with status: ${data.status}`);
        return null;
      }

      const results = data.data.result;
      if (!results || results.length === 0) {
        this.logger.warn(`No logs found for transaction hash: ${trxHash}`);
        return null;
      }

      // Extract trace IDs from log entries
      const traceIds = new Set<string>();

      for (const result of results) {
        for (const [timestamp, logLine] of result.values) {
          try {
            // Try to parse as JSON first
            const logEntry = JSON.parse(logLine);
            if (logEntry.trace_id && logEntry.trace_id !== 'N/A') {
              traceIds.add(logEntry.trace_id);
            }
          } catch {
            // If not JSON, check if the line is just a trace ID
            const traceIdPattern = /^[a-f0-9]{32}$/;
            if (traceIdPattern.test(logLine.trim())) {
              traceIds.add(logLine.trim());
            }
          }
        }
      }

      if (traceIds.size === 0) {
        this.logger.warn(
          `No valid trace IDs found for transaction hash: ${trxHash}`,
        );
        return null;
      }

      // Return the first (most recent) trace ID
      const latestTraceId = Array.from(traceIds)[0];

      this.logger.log(
        `Found trace ID ${latestTraceId} for transaction hash ${trxHash}. ` +
          `Total unique trace IDs found: ${traceIds.size}`,
      );

      return latestTraceId;
    } catch (error) {
      this.logger.error(
        `Error querying Loki for transaction hash ${trxHash}: ${error.message}`,
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
