import { Injectable } from '@nestjs/common';
import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import { ProposalUpdateService } from 'src/proposal-update/proposal-update.service';
import { TransactionConfirmationSource } from 'src/transactions/entities/transaction.entity';
import { TransactionsService } from 'src/transactions/transactions.service';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { WinstonLogger } from 'src/shared/common/logger/winston-logger';
import { TraceContextService } from 'src/shared/common/tracing/trace-context.service';
import { TempoService } from 'src/shared/common/tracing/tempo.service';

require('dotenv').config();
const { Network, Alchemy } = require('alchemy-sdk');

const settings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network[process.env.ALCHEMY_NETWORK] || Network.ETH_SEPOLIA,
};
// Ref: https://github.com/alchemyplatform/alchemy-sdk-js/blob/master/docs-md/enums/Network.md

const alchemy = new Alchemy(settings);

@Injectable()
export class TasksService {
  private tracer = trace.getTracer('audit-trail-service', '1.0');
  private cronJobName = 'check-pending-transactions';
  private cronTraceSyncFlag = false;
  private typeDrivenFunctionCall: Record<string, (transaction: any) => void>;

  constructor(
    private transactionService: TransactionsService,
    private proposalUpdateService: ProposalUpdateService,
    private schedulerRegistry: SchedulerRegistry,
    private readonly logger: WinstonLogger,
    private readonly traceContextService: TraceContextService,
    private readonly tempoService: TempoService,
  ) {
    this.logger.setContext(TasksService.name);
    this.typeDrivenFunctionCall = {
      '0': this.handleMembershipApprovalProposalCreated.bind(this),
      '1': this.handleGeneralProposalCreated.bind(this),
      // Add more strings and corresponding functions as needed
    };
  }

  async handleGeneralProposalCreated(transaction: any) {
    this.logger.log(`CRON: General Proposal Being Sent To DAO-Service!`);

    await this.transactionService.updateStatus(
      transaction.transactionHash,
      transaction,
      TransactionConfirmationSource.THE_GRAPH,
      1,
    );

    await this.proposalUpdateService.updatedGeneralProposal({
      web3Status: 1,
      message: 'Transaction updated successfully.',
      data: { ...transaction },
      blockNumber: transaction.blockNumber,
      transactionHash: transaction.transactionHash,
    });
  }

  async handleMembershipApprovalProposalCreated(transaction: any) {
    this.logger.log(
      `CRON: Membership Approval Proposal being emitted to event bus`,
    );

    await this.transactionService.updateStatus(
      transaction.transactionHash,
      transaction,
      TransactionConfirmationSource.THE_GRAPH,
      1,
    );
    await this.proposalUpdateService.updatedTransaction({
      web3Status: 1,
      message: 'Transaction updated successfully.',
      data: { ...transaction },
      blockNumber: transaction.blockNumber,
      transactionHash: transaction.transactionHash,
    });
  }

  async handleProposalStatusUpdate(transaction: any) {
    this.logger.log(
      `CRON: Proposal Executed or Cancelled being emitted to event bus`,
    );

    await this.transactionService.updateStatus(
      transaction.transactionHash,
      transaction,
      TransactionConfirmationSource.THE_GRAPH,
      1,
    );
    await this.proposalUpdateService.updatedTransaction({
      web3Status: 1,
      message: 'Transaction updated successfully.',
      data: { ...transaction },
      blockNumber: transaction.blockNumber,
      transactionHash: transaction.transactionHash,
    });
  }

  async handleEventEmissionBasedOnProposalType(transaction: any) {
    const proposalType = transaction.proposalType;

    if (this.typeDrivenFunctionCall[proposalType]) {
      // Call the corresponding function from the dictionary
      this.logger.log(
        `Calling function for on-chain event: ${this.typeDrivenFunctionCall[proposalType]?.name ?? 'Unknown function'}`,
      );
      await this.typeDrivenFunctionCall[proposalType](transaction);
    } else {
      this.logger.warn(`Proposal type ${proposalType} is not recognized.`);
    }
  }

  // Update confirmation source and status for pending transactions
  @Cron('30 * * * * *', { name: 'check-pending-transactions' })
  async handleCron() {
    const span = this.tracer.startSpan(
      'audit-trail.cron.check-pending-transactions',
    );

    try {
      // ✅ ALL logic inside trace context
      await context.with(trace.setSpan(context.active(), span), async () => {
        // Now this will have proper trace context
        const traceContext = this.traceContextService.getCurrentTraceContext();
        this.logger.log(
          `Cron job started to look for pending transactions [trace_id=${traceContext.trace_id}] [span_id=${traceContext.span_id}]`,
        );

        // Get pending proposals from DB
        this.logger.log('CRON: Querying transactions from Transaction DB');
        const pendingTransactionHash =
          await this.transactionService.getPendingTransactionHash();

        this.logger.log(
          `CRON: These are the pending transaction hashes: ${pendingTransactionHash}`,
        );

        // Query pending transactions from GraphQL
        this.logger.log(`CRON: Querying pending transactions from The Graph`);
        const pendingTransactions =
          await this.proposalUpdateService.getTransactionUpdates(
            pendingTransactionHash,
          );

        if (!pendingTransactions || pendingTransactions.length === 0) {
          this.logger.log(`CRON: No pending transactions!`);
          return;
        }

        this.logger.log(
          `CRON: Found pending transactions: ${pendingTransactions}`,
        );

        const eventDataArray: any[] = [];
        const transactionTypes = [
          'proposalExecuteds',
          'proposalCreateds',
          'proposalCanceleds',
          'proposalAddeds',
          'ownershipTransferreds',
          'memberRegistereds',
          'memberApproveds',
        ];

        for (const type of transactionTypes) {
          if (pendingTransactions[type]) {
            eventDataArray.push(
              ...pendingTransactions[type].map((tx: any) => ({
                ...tx,
                eventType: type,
              })),
            );
          }
        }

        // Remove duplicates based on transactionHash
        const uniqueTransactions = Array.from(
          new Map(
            eventDataArray.map((tx) => [tx.transactionHash, tx]),
          ).values(),
        );

        // Update each transaction
        for (const transaction of uniqueTransactions) {
          const childSpan = this.tracer.startSpan(
            'audit-trail.cron.process-transaction',
          );

          try {
            await context.with(
              trace.setSpan(context.active(), childSpan),
              async () => {
                if (transaction.__typename == 'ProposalAdded') {
                  await this.handleEventEmissionBasedOnProposalType(
                    transaction,
                  );
                } else {
                  await this.handleProposalStatusUpdate(transaction);
                }

                this.transactionService.synchronizeTransactionTrace(
                  transaction.transactionHash,
                );
                this.logger.log(
                  `CRON: Transaction ${transaction.transactionHash} successfully updated.`,
                );
              },
            );

            childSpan.setStatus({ code: SpanStatusCode.OK });
          } catch (error) {
            childSpan.recordException(error);
            childSpan.setStatus({
              code: SpanStatusCode.ERROR,
              message: error.message,
            });
            this.logger.error(
              `CRON: Failed to update transaction ${transaction.transactionHash}: ${error.message}`,
            );
          } finally {
            childSpan.end();
          }
        }
      });

      span.setStatus({ code: SpanStatusCode.OK });
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      this.logger.error('Cron job failed:', error);
    } finally {
      span.end();
    }
  }

  private stopCronJob() {
    try {
      const job = this.schedulerRegistry.getCronJob(this.cronJobName);
      job.stop();
      this.logger.log(`Cron job ${this.cronJobName} has been stopped`);
    } catch (error) {
      this.logger.error(`Failed to stop cron job: ${error.message}`);
    }
  }

  // Method to start the cron job
  private startCronJob() {
    try {
      const job = this.schedulerRegistry.getCronJob(this.cronJobName);
      job.start();
      this.logger.log(`Cron job ${this.cronJobName} has been started`);
    } catch (error) {
      this.logger.error(`Failed to start cron job: ${error.message}`);
    }
  }

  async listenProposalTrx() {
    // ✅ Child span - will inherit parent context from AppModule
    const span = this.tracer.startSpan('audit-trail.websocket.listener-setup');

    try {
      await context.with(trace.setSpan(context.active(), span), async () => {
        const proposalTopic = process.env.PROPOSAL_TOPIC;
        const proposalEndTopic = process.env.PROPOSAL_END_TOPIC;
        const daoContractAddress = process.env.DAO_CONTRACT_ADDRESS;

        this.logger.log(
          'WebSocket listener initialized for proposal transactions',
        );

        const ProposalAddedEvents = {
          address: daoContractAddress,
          topics: [proposalTopic, proposalEndTopic],
        };

        // Event handler with separate spans
        alchemy.ws.on(ProposalAddedEvents, async (txn) => {
          // Create independent span for each event (not child of setup span)
          const eventSpan = this.tracer.startSpan(
            'audit-trail.websocket.proposal-event',
            {
              attributes: {
                'websocket.event.type': 'ProposalAdded',
                'websocket.transaction.hash': txn.transactionHash,
                'websocket.block.number': txn.blockNumber,
              },
            },
          );

          try {
            await context.with(
              trace.setSpan(context.active(), eventSpan),
              async () => {
                this.logger.log('WEBSOCKET: Stopping Cron');
                this.stopCronJob();

                this.logger.log(
                  `WEBSOCKET: New Proposal Creation is successful. Transaction Hash: ${txn.transactionHash}`,
                );

                const isProposalEndTopicZero =
                  txn.topics[1] === proposalEndTopic;

                if (isProposalEndTopicZero) {
                  // Process the event within span context
                  await this.processProposalEvent(txn);
                }

                this.logger.log('WEBSOCKET: Starting Cron');
                this.startCronJob();
              },
            );

            eventSpan.setStatus({ code: SpanStatusCode.OK });
          } catch (error) {
            eventSpan.recordException(error);
            eventSpan.setStatus({
              code: SpanStatusCode.ERROR,
              message: error.message,
            });
            this.logger.error(
              `WEBSOCKET: Error handling event: ${error.message}`,
            );
          } finally {
            eventSpan.end();
            this.startCronJob();
          }
        });
      });

      span.setStatus({ code: SpanStatusCode.OK });
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      throw error; // Re-throw so AppModule can handle
    } finally {
      this.startCronJob();
      span.end();
    }
  }

  private async processProposalEvent(txn: any) {
    const processSpan = this.tracer.startSpan(
      'audit-trail.websocket.process-proposal-event',
    );

    try {
      await context.with(
        trace.setSpan(context.active(), processSpan),
        async () => {
          this.logger.log(
            'WEBSOCKET: proposalEndTopic is zero for ProposalCreated event.',
          );

          const delay = 10000;
          this.logger.log(
            `WEBSOCKET: Waiting for ${delay / 1000} seconds to allow the indexer to update.`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));

          // Fetch data within span context
          const data =
            await this.proposalUpdateService.getProposalAddedEventByHash(
              txn.transactionHash,
            );

          const eventData = {
            data: {
              proposalId: data?.proposalId,
              proposalType: data?.proposalType,
              proposedWallet: data?.data,
              __typename: data?.__typename,
            },
          };

          // Update transaction within span context
          const updatedTransaction = await this.transactionService.updateStatus(
            txn.transactionHash,
            JSON.stringify(eventData),
            TransactionConfirmationSource.ALCHEMY,
            1,
          );

          if (updatedTransaction) {
            await this.proposalUpdateService.updatedTransaction({
              web3Status: 1,
              message: 'New Member Proposal Placed Successfully.',
              ...eventData,
              blockNumber: txn.blockNumber,
              transactionHash: txn.transactionHash,
            });
            this.transactionService.synchronizeTransactionTrace(
              txn.transactionHash,
            );
            this.logger.log(
              'WEBSOCKET: New member proposal transaction update event has been emitted!',
            );
          }
        },
      );

      processSpan.setStatus({ code: SpanStatusCode.OK });
    } catch (error) {
      processSpan.recordException(error);
      processSpan.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      throw error;
    } finally {
      processSpan.end();
    }
  }

  // Update transaction confirmation trace for pending transactions.
  @Cron('30 */2 * * * *', { name: 'sync-pending-transaction-traces' })
  async syncPendingTransactionTraces() {
    const span = this.tracer.startSpan(
      'audit-trail.cron.sync-pending-transaction-traces',
    );

    if (this.cronTraceSyncFlag) {
      this.logger.log(
        'CRON: Trace synchronization is already in progress. Skipping this run.',
      );
      span.end();
      return;
    }

    /*
      1. Get trx_hash where tracing is not available yet
      2. Check & get the latest trace_ids for those trx_hashes
      3. For each trace_id
        a. call tempoService.extractServiceStatus(id)
        b. populate db (query through trx_hash)
    */

    try {
      await context.with(trace.setSpan(context.active(), span), async () => {
        this.cronTraceSyncFlag = true;
        this.logger.log(
          'CRON: Querying transactions from Transaction DB for trace synchronization',
        );
        const transactionHashes =
          await this.transactionService.getTransactionHashForTraceSync();

        if (transactionHashes.length === 0) {
          this.logger.log(
            'CRON: No transaction hashes found needing trace sync',
          );
          return;
        }

        this.logger.log(
          `CRON: Total transactions needing trace sync: ${transactionHashes.length}`,
        );

        for (const trxHash of transactionHashes) {
          const childSpan = this.tracer.startSpan(
            'audit-trail.cron.sync-single-transaction-trace',
          );

          try {
            await context.with(
              trace.setSpan(context.active(), childSpan),
              async () => {
                this.logger.log(
                  `CRON: Synchronizing trace for transaction hash: ${trxHash}`,
                );
                const trace_id =
                  await this.transactionService.getTraceIdByTransactionHash(
                    trxHash,
                  );

                if (!trace_id) {
                  this.logger.log(
                    `CRON: No trace ID found for transaction ${trxHash}`,
                  );
                  return;
                }

                this.logger.log(
                  `CRON: Found trace ID ${trace_id} for transaction ${trxHash}. Extracting service status...`,
                );

                const trace =
                  await this.tempoService.extractServiceStatus(trace_id);

                if (trace.length === 0) {
                  this.logger.log(
                    `CRON: No spans found for trace ID ${trace_id}`,
                  );
                  return;
                }

                this.logger.log(
                  `CRON: Extracted ${trace.length} spans for trace ID ${trace_id}. Updating transaction...`,
                );

                await this.transactionService.updateTransactionTrace(
                  trxHash,
                  trace,
                );
                this.logger.log(
                  `CRON: Transaction ${trxHash} trace synchronization attempted.`,
                );
              },
            );

            childSpan.setStatus({ code: SpanStatusCode.OK });
          } catch (error) {
            childSpan.recordException(error);
            childSpan.setStatus({
              code: SpanStatusCode.ERROR,
              message: error.message,
            });
            this.logger.error(
              `CRON: Failed to synchronize trace for transaction ${trxHash}: ${error.message}`,
            );
          } finally {
            childSpan.end();
          }
        }
      });
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      this.logger.error('Cron job failed:', error);
    } finally {
      this.cronTraceSyncFlag = false;
      span.end();
    }
  }
}
