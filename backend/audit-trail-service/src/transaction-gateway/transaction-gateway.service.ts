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
import { TransactionGatewayUtil } from './transactions-gateway.util';

@Injectable()
export class TransactionGatewayService {
  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
    private readonly logger: WinstonLogger,
    private readonly traceContextService: TraceContextService,
    private readonly tempoService: TempoService,
    private readonly transactionGatewayUtil: TransactionGatewayUtil,
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
        chain_id: event.onChainData?.chainId,
        trx_status: 0,
        raw_trx: JSON.stringify(event.onChainData?.context),
      };
      const dbRecordedTRX = this.transactionRepository.create(new_dao_audit);
      this.logger.log(
        `New transaction initialized at Audit Trail DB, where transaction hash: ${dbRecordedTRX.trx_hash}, chain ID: ${dbRecordedTRX.chain_id}`,
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
    const { page = 1, limit = 10, status, source, hash, address, functionName } = query;
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

    if(address){
      queryBuilder.andWhere("transaction.trx_receipt->>'from' = :address", { address });
    }


    if(functionName){
      queryBuilder.andWhere(
        "(transaction.trx_metadata::jsonb->>'__typename' ILIKE :functionName OR transaction.trx_metadata::jsonb->'data'->>'__typename' ILIKE :functionName)", 
        { functionName: `%${functionName}%` }
      );
    }


    //from er wallet address diye query
    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder
      .select([
        'transaction.id',
        'transaction.trx_hash',
        'transaction.chain_id',
        'transaction.trx_status',
        'transaction.confirmation_source',
        'transaction.transaction_confirmation_trace',
        'transaction.updated_at',
        'transaction.trx_receipt',
        'transaction.trx_metadata',
      ])
      .skip(skip)
      .take(limit)
      .orderBy('transaction.created_at', 'DESC');

    const transactions = await queryBuilder.getMany();
    const transactionsDto = transactions.map((tx) => {
      const gasUsed = tx.trx_receipt?.gasUsed || '0';
      const event_logs = this.transactionGatewayUtil.parseMetadata(tx);
      const functionName = event_logs.__typename || 'unknown';
      return {
        id: tx.id,
        trx_hash: tx.trx_hash,
        chain_id: tx.chain_id,
        trx_status: tx.trx_status,
        confirmation_source: tx.confirmation_source,
        transaction_confirmation_trace: tx.transaction_confirmation_trace || [],
        updated_at: tx.updated_at,
        from: tx.trx_receipt?.from || 'unknown',
        to: tx.trx_receipt?.to || 'unknown',
        address: tx.trx_receipt?.logs[0]?.address || 'unknown',
        gas_cost: Number(gasUsed) / 1e18,
        event_logs: tx.trx_metadata,
        function: functionName,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: transactionsDto,
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
    const transactionFee = this.transactionGatewayUtil.calculateTransactionFee(
      BigInt(transaction.trx_receipt.gasUsed || 0),
      BigInt(transaction.trx_receipt.effectiveGasPrice || 0),
    );

    const metadata = this.transactionGatewayUtil.parseMetadata(transaction);

    const value = metadata.value;
    const functionName = metadata.__typename;
    const gasUsed = transaction.trx_receipt.gasUsed;
    const lifecycle =
      this.transactionGatewayUtil.generateTransactionLifecycle(transaction);

    return {
      id: transaction.id,
      trx_hash: transaction.trx_hash,
      chain_id: transaction.chain_id,
      trx_status: transaction.trx_status,
      source: transaction.confirmation_source,
      metaData: transaction.trx_metadata,
      transaction_lifecycle: lifecycle,
      transaction_fee: transactionFee.feeInEth,
      value: value,
      to: transaction.trx_receipt.to,
      from: transaction.trx_receipt.from,
      event_logs: transaction.trx_metadata,
      raw_transaction: transaction.raw_trx,
      transaction_receipt: JSON.stringify(transaction.trx_receipt),
      function: functionName,
      gas_cost: Number(gasUsed) / 1e18,
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

    const transactionFee = this.transactionGatewayUtil.calculateTransactionFee(
      BigInt(transaction.trx_receipt.gasUsed || 0),
      BigInt(transaction.trx_receipt.effectiveGasPrice || 0),
    );

    const metadata = this.transactionGatewayUtil.parseMetadata(transaction);

    const value = metadata.value;
    const functionName = metadata.__typename;
    const gasUsed = transaction.trx_receipt.gasUsed;
    const lifecycle =
      this.transactionGatewayUtil.generateTransactionLifecycle(transaction);

    return {
      id: transaction.id,
      trx_hash: transaction.trx_hash,
      chain_id: transaction.chain_id,
      trx_status: transaction.trx_status,
      source: transaction.confirmation_source,
      metaData: transaction.trx_metadata,
      transaction_lifecycle: lifecycle,
      transaction_fee: transactionFee.feeInEth,
      value: value,
      to: transaction.trx_receipt.to,
      from: transaction.trx_receipt.from,
      event_logs: transaction.trx_metadata,
      raw_transaction: transaction.raw_trx,
      transaction_receipt: JSON.stringify(transaction.trx_receipt),
      function: functionName,
      gas_cost: Number(gasUsed) / 1e18,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
    };
  }

  async getStatistics(): Promise<any> {
    const transactions = await this.transactionRepository.find();
    const overallStats =
      this.transactionGatewayUtil.overallTransactionStats(transactions);

    const timeSeries =
      await this.transactionGatewayUtil.generateTransactionTimeSeries();

    const resourceTypeStats =
      this.transactionGatewayUtil.getResourceTypeStats(transactions);

    const topParticipants = this.transactionGatewayUtil.getTopParticipants(
      transactions,
      5,
    );

    const stats = {
      overallStats,
      timeSeries,
      resourceTypeStats,
      topParticipants,
    };
    return stats;
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

  async createTransaction(event: any): Promise<TransactionEntity> {
    this.logger.log(
      `Creating new transaction with hash: ${event.onChainData?.transactionHash}`,
    );
    try {
      // Check if transaction already exists
      const existingTransaction = await this.transactionRepository.findOne({
        where: { trx_hash: event.onChainData?.transactionHash },
      });

      if (existingTransaction) {
        this.logger.warn(
          `Transaction with hash ${event.onChainData?.transactionHash} already exists`,
        );
        throw new Error('Transaction already exists');
      }

      const newTransaction = {
        trx_hash: event.onChainData?.transactionHash,
        trx_sender: event.onChainData?.signedBy,
        chain_id: event.onChainData?.chainId,
        trx_status: 0,
        raw_trx: JSON.stringify(event.onChainData?.context),
      };

      const dbRecordedTRX = this.transactionRepository.create(newTransaction);
      this.logger.log(
        `New transaction initialized at Audit Trail DB, where transaction hash: ${dbRecordedTRX.trx_hash}`,
      );

      const savedTransaction =
        await this.transactionRepository.save(dbRecordedTRX);

      this.logger.log(`Recorded transaction ID: ${savedTransaction.id} in DB`);
      return savedTransaction;
    } catch (error) {
      this.logger.error(
        `Transaction couldn't be created in DB where transaction hash is ${event.onChainData?.transactionHash}. Error: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
