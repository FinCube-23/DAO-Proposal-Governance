import { Injectable } from '@nestjs/common';
import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import { TransactionUpdateService } from 'src/transaction-updater/transaction-update.service';
import { TransactionConfirmationSource } from 'src/shared/common/entity/transaction.entity';
import { TransactionGatewayService } from 'src/transaction-gateway/transaction-gateway.service';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { WinstonLogger } from 'src/shared/common/logger/winston-logger';
import { TraceContextService } from 'src/shared/common/tracing/trace-context.service';
import { TempoService } from 'src/shared/common/tracing/tempo.service';
import { ProposalType } from 'src/shared/common/dto/onchain-data.dto';

require('dotenv').config();
const { Network, Alchemy } = require('alchemy-sdk');

// Map environment network names to Alchemy SDK Network enum or custom URL
const getAlchemySettings = (networkName: string, apiKey: string, alchemyUrl?: string) => {
  const networkMap = {
    'eth-mainnet': Network.ETH_MAINNET,
    'eth-sepolia': Network.ETH_SEPOLIA,
    'eth-goerli': Network.ETH_GOERLI,
    'polygon-mainnet': Network.MATIC_MAINNET,
    'polygon-mumbai': Network.MATIC_MUMBAI,
    'polygon-amoy': Network.MATIC_AMOY,
    'arbitrum-mainnet': Network.ARB_MAINNET,
    'arbitrum-sepolia': Network.ARB_SEPOLIA,
    'optimism-mainnet': Network.OPT_MAINNET,
    'optimism-sepolia': Network.OPT_SEPOLIA,
    'base-mainnet': Network.BASE_MAINNET,
    'base-sepolia': Network.BASE_SEPOLIA,
  };
  
  // If network is in the map, use it
  if (networkMap[networkName]) {
    return {
      apiKey,
      network: networkMap[networkName],
    };
  }
  
  // For custom networks like celo-sepolia, use custom URL
  if (alchemyUrl) {
    return {
      apiKey,
      url: alchemyUrl,
    };
  }
  
  // Fallback to ETH_SEPOLIA
  return {
    apiKey,
    network: Network.ETH_SEPOLIA,
  };
};

const settings = getAlchemySettings(
  process.env.ALCHEMY_NETWORK,
  process.env.ALCHEMY_API_KEY,
  process.env.ALCHEMY_URL,
);
// Ref: https://github.com/alchemyplatform/alchemy-sdk-js/blob/master/docs-md/enums/Network.md

const alchemy = new Alchemy(settings);

@Injectable()
export class TasksService {
  private tracer = trace.getTracer('audit-trail-service', '1.0');
  private cronJobName = 'check-pending-transactions';
  private cronTraceSyncFlag = false;

  constructor(
    private transactionGatewayService: TransactionGatewayService,
    private transactionUpdateService: TransactionUpdateService,
    private schedulerRegistry: SchedulerRegistry,
    private readonly logger: WinstonLogger,
    private readonly traceContextService: TraceContextService,
    private readonly tempoService: TempoService,
  ) {
    this.logger.setContext(TasksService.name);
    this.logger.log(
      `Alchemy WebSocket initialized with network: ${process.env.ALCHEMY_NETWORK}, URL: ${settings.url || 'using network enum'}`,
    );
  }

  // Handle transaction event emission
  async handleTransactionEventEmission(transaction: any) {
    this.logger.log(
      `Handling event emission for transaction: ${transaction.transactionHash}, type: ${transaction.__typename}`,
    );

    await this.transactionUpdateService.updateTransactionStatus(
      transaction.transactionHash,
      transaction,
      TransactionConfirmationSource.THE_GRAPH,
      1,
    );

    // Build context object - only include proposalType if it exists
    const context: any = {
      __typename: transaction.__typename,
      event_logs: JSON.stringify({ ...transaction }),
    };

    // Only add proposalType for governance events
    if (transaction.proposalType !== undefined) {
      context.proposalType = transaction.proposalType as ProposalType;
    }

    // Add organizationId if present
    if (transaction.organizationId !== undefined) {
      context.organizationId = transaction.organizationId;
    }

    await this.transactionUpdateService.handleTransactionEventEmission({
      web3Status: 1,
      message: 'Transaction updated successfully.',
      data: { ...transaction },
      blockNumber: transaction.blockNumber,
      onChainData: {
        transactionHash: transaction.transactionHash,
        context,
      },
    });

    this.logger.log(
      `Event emission handled for transaction: ${transaction.transactionHash}, emitted to appropriate exchange`,
    );
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
          await this.transactionUpdateService.getHashOfPendingTransactions();

        if (pendingTransactionHash.length === 0) {
          this.logger.log('CRON: No pending transactions found!');
          return;
        }

        this.logger.log(
          `CRON: These are the pending transaction hashes: ${JSON.stringify(pendingTransactionHash)}`,
        );

        // Query pending transactions from GraphQL
        this.logger.log(`CRON: Querying ${pendingTransactionHash.length} pending transactions from The Graph`);
        const pendingTransactions =
          await this.transactionUpdateService.getTransactionUpdatesFromTheGraph(
            pendingTransactionHash,
          );

        if (!pendingTransactions) {
          this.logger.warn(`CRON: The Graph returned null/undefined response`);
          return;
        }

        this.logger.log(
          `CRON: The Graph response: ${JSON.stringify(pendingTransactions)}`,
        );

        // Check if any transaction type has data
        const hasAnyData = Object.values(pendingTransactions).some(
          (arr: any) => Array.isArray(arr) && arr.length > 0,
        );

        if (!hasAnyData) {
          this.logger.warn(
            `CRON: No events found in The Graph for ${pendingTransactionHash.length} pending transaction(s). They may not be indexed yet.`,
          );
          return;
        }

        const eventDataArray: any[] = [];
        const transactionTypes = [
          'proposalExecuteds',
          'proposalCanceleds',
          'proposalAddeds',
          'ownershipTransferreds',
          'memberRegistereds',
          'memberApproveds',
          'stablecoinTransfers',
        ];

        for (const type of transactionTypes) {
          if (pendingTransactions[type] && pendingTransactions[type].length > 0) {
            this.logger.log(
              `CRON: Found ${pendingTransactions[type].length} ${type} event(s)`,
            );
            eventDataArray.push(
              ...pendingTransactions[type].map((tx: any) => ({
                ...tx,
                eventType: type,
              })),
            );
          }
        }

        if (eventDataArray.length === 0) {
          this.logger.warn(
            `CRON: No events extracted from The Graph response despite having data`,
          );
          return;
        }

        // Remove duplicates based on transactionHash
        const uniqueTransactions = Array.from(
          new Map(
            eventDataArray.map((tx) => [tx.transactionHash, tx]),
          ).values(),
        );

        this.logger.log(
          `CRON: Processing ${uniqueTransactions.length} unique transactions`,
        );

        // Update each transaction
        for (const transaction of uniqueTransactions) {
          this.logger.log(
            `CRON: Processing transaction ${transaction.transactionHash} of type ${transaction.__typename || transaction.eventType}`,
          );
          const childSpan = this.tracer.startSpan(
            'audit-trail.cron.process-transaction',
          );

          try {
            await context.with(
              trace.setSpan(context.active(), childSpan),
              async () => {
                await this.handleTransactionEventEmission(transaction);
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

  async listenTransaction() {
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

        // Add error handler for WebSocket
        alchemy.ws.on('error', (error) => {
          this.logger.error(`WebSocket error: ${error.message}`);
        });

        // Add close handler
        alchemy.ws.on('close', () => {
          this.logger.warn(
            'WebSocket connection closed. Attempting to reconnect...',
          );
        });

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
                  await this.processTransactionEvent(txn);
                }

                this.logger.log('WEBSOCKET: Starting Cron');
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

  // * Helpers
  private async processTransactionEvent(txn: any) {
    // Start a new span for processing the proposal event
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
            await this.transactionUpdateService.getTransactionUpdatesFromTheGraph(
              [txn.transactionHash],
            );

          const proposalAddedEvent = data?.proposalAddeds?.[0];
          if (!proposalAddedEvent) {
            this.logger.warn(
              `WEBSOCKET: No proposalAddedEvent found for transaction: ${txn.transactionHash}`,
            );
          }

          const eventData = {
            data: {
              proposalId: proposalAddedEvent?.proposalId,
              proposalType: proposalAddedEvent?.proposalType,
              proposedWallet: proposalAddedEvent?.proposedWallet,
              __typename: proposalAddedEvent?.__typename,
              blockTimestamp: proposalAddedEvent?.blockTimestamp,
              blockNumber: proposalAddedEvent?.blockNumber,
              transactionHash: proposalAddedEvent?.transactionHash,
            },
          };

          /*
            TODO: Update transaction within span context
          */
          const updatedTransaction =
            await this.transactionUpdateService.updateTransactionStatus(
              txn.transactionHash,
              JSON.stringify(eventData),
              TransactionConfirmationSource.ALCHEMY,
              1,
            );

          // * For emitting event to DAO-Service & UMS via MQ
          if (updatedTransaction) {
            await this.transactionUpdateService.handleTransactionEventEmission({
              web3Status: 1,
              message: 'New Member Proposal Placed Successfully.',
              ...eventData,
              blockNumber: txn.blockNumber,
              onChainData: {
                transactionHash: txn.transactionHash,
                context: {
                  proposalType: eventData.data.proposalType as ProposalType,
                  __typename: eventData.data.__typename,
                  event_logs: JSON.stringify({ ...eventData.data }),
                },
              },
            });

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
          await this.transactionGatewayService.getTransactionHashForTraceSync();

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
                  await this.transactionGatewayService.getTraceIdByTransactionHash(
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

                await this.transactionGatewayService.updateTransactionTrace(
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
