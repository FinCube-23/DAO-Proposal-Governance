import {
  CreatedProposalDto,
  MessageEnvelopeDto,
  PendingTransactionDto,
  ProposeEnvelopeDto,
  MessageResponse,
} from './dto/proposal-update.dto';
import {
  TransactionConfirmationSource,
  TransactionEntity,
  TransactionStatus,
} from '../shared/common/entity/transaction.entity';
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy, Ctx, RmqContext } from '@nestjs/microservices';
import { TransactionIndexerRepository } from '../transaction-indexer/transaction-indexer.repository';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { WinstonLogger } from 'src/shared/common/logger/winston-logger';
import { Repository } from 'typeorm';
import { TraceContextService } from 'src/shared/common/tracing/trace-context.service';
import { TransactionStatusDto } from 'src/shared/common/dto/transaction-status.dto';

@Injectable()
export class TransactionUpdateService {
  public update_proposals: CreatedProposalDto[];

  constructor(
    private readonly transactionUpdateRepository: TransactionIndexerRepository,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    private readonly traceContextService: TraceContextService,
    private readonly amqpConnection: AmqpConnection,
    private readonly logger: WinstonLogger,
  ) {
    this.update_proposals = [];
  }

  // 💬 Pushing Event in the Message Queue in EventPattern
  async handleTransactionEventEmission(proposal: TransactionStatusDto) {
    await this.amqpConnection.publish('exchange.web3_event_hub.fanout', '', proposal);
    this.logger.log('CRON: Transaction on-chain status update notified!');
    return { message: 'Proposal on-chain status update notified!' };
  }

  async getTransactionUpdatesFromTheGraph(trx_hashes: string[]): Promise<any> {
    return await this.transactionUpdateRepository.getTransactionUpdatesFromTheGraph(
      trx_hashes,
    );
  }

  async updateTransactionStatus(
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

      // * Trace id is not unique per transaction, meaning multiple transactions can share the same trace id
      // * As the graph can fetch multiple transactions under the same trace id, we set the trace id here again to ensure it's captured
      const { trace_id } = this.traceContextService.getCurrentTraceContext();
      transaction.trace_id = trace_id;

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

  async getHashOfPendingTransactions(): Promise<string[]> {
    try {
      const transactions = await this.transactionRepository.find({
        where: {
          trx_status: TransactionStatus.PENDING,
        },
        take: 100,
      });
      return transactions.map((transaction) => transaction.trx_hash);
    } catch {
      this.logger.error('Could not find any pending transactions');
      return [];
    }
  }
}
