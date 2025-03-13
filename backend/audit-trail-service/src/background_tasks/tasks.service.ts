import { Injectable, Logger } from '@nestjs/common';
import { ProposalUpdateService } from 'src/proposal-update/proposal-update.service';
import { TransactionConfirmationSource } from 'src/transactions/entities/transaction.entity';
import { TransactionsService } from 'src/transactions/transactions.service';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';


require('dotenv').config();
const { Network, Alchemy } = require("alchemy-sdk");

const settings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network[process.env.ALCHEMY_NETWORK] || Network.ETH_SEPOLIA,
};
// Ref: https://github.com/alchemyplatform/alchemy-sdk-js/blob/master/docs-md/enums/Network.md

const alchemy = new Alchemy(settings);

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private cronJobName = 'check-pending-transactions';
  constructor(
    private transactionService: TransactionsService,
    private proposalUpdateService: ProposalUpdateService,
    private schedulerRegistry: SchedulerRegistry
  ) { }

  @Cron('30 * * * * *', { name: 'check-pending-transactions' })
  async handleCron() {
    this.logger.log("Cron job started to look for pending transactions");
    //Get pending proposals from DB
    this.logger.log("CRON: Quering transactions from Transaction DB");

    const pendingTransactionHash = await this.transactionService.getPendingTransactionHash();

    this.logger.log(`CRON: This are the pending transaction hashes: ${pendingTransactionHash}`);

    //Query pending transactions (if any) from GraphQL
    this.logger.log(`CRON: Quering pending transactions from The Graph`);

    const pendingTransactions = await this.proposalUpdateService.getTransactionUpdates(pendingTransactionHash);

    if (!pendingTransactions || pendingTransactions.length === 0) {
      this.logger.log(`CRON: No pending transactions!`);
      return;
    }

    this.logger.log(`CRON: Found pending transactions: ${pendingTransactions}`);


    const eventDataArray: any[] = [];

    const transactionTypes = [
      "proposalExecuteds",
      "proposalCreateds",
      "proposalCanceleds",
      "proposalAddeds",
      "ownershipTransferreds",
      "memberRegistereds",
      "memberApproveds"
    ];


    for (const type of transactionTypes) {
      if (pendingTransactions[type]) {
        eventDataArray.push(...pendingTransactions[type].map((tx: any) => ({
          ...tx,
          eventType: type // Store which event type it belongs to
        })));
      }
    }


    // Remove duplicates based on `transactionHash`
    const uniqueTransactions = Array.from(
      new Map(eventDataArray.map((tx) => [tx.transactionHash, tx])).values()
    );

    //update each transactions
    for (const transaction of uniqueTransactions) {
      try {
        await this.transactionService.updateStatus(
          transaction.transactionHash,
          transaction,
          TransactionConfirmationSource.THE_GRAPH,
          1
        );
        await this.proposalUpdateService.updatedTransaction({
          web3Status: 1,
          message: "Transaction updated successfully.",
          data: { ...transaction },
          blockNumber: transaction.blockNumber,
          transactionHash: transaction.transactionHash,
        });

        this.logger.log(`CRON: Transaction ${transaction.transactionHash} successfully updated.`);
      } catch (updateError) {
        this.logger.error(`CRON: Failed to update transaction ${transaction.transactionHash}: ${updateError.message}`);
      }
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
    const proposalTopic = process.env.PROPOSAL_TOPIC;
    const proposalEndTopic = process.env.PROPOSAL_END_TOPIC;
    const daoContractAddress = process.env.DAO_CONTRACT_ADDRESS;
    // Utility function to pause execution for a given number of milliseconds
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    // Create the log options object.
    const ProposalAddedEvents = {
      address: daoContractAddress,
      topics: [proposalTopic, proposalEndTopic],
    };

    // Open the websocket and listen for events!
    alchemy.ws.on(ProposalAddedEvents, async (txn) => {
      try {
        this.logger.log("WEBSOCKET: Stopping Cron");
        this.stopCronJob();
        this.logger.log(`WEBSOCKET: New Proposal Creation is successful. Transaction Hash: ${txn.transactionHash}`);
        this.logger.log(`WEBSOCKET: proposalEndTopic Value: ${txn.topics[1]}`);
        console.log(JSON.stringify(txn, null, 2));
        console.dir(txn, { depth: null });

        const isProposalEndTopicZero = txn.topics[1] === proposalEndTopic;

        if (isProposalEndTopicZero) {
          this.logger.log('WEBSOCKET: proposalEndTopic is zero for ProposalCreated event.');
          this.logger.log('WEBSOCKET: New member proposal transaction placed on-chain.');

          // Introduce a 10-second delay before fetching the data
          const delay = 10000; // 10 seconds
          this.logger.log(`WEBSOCKET: Waiting for ${delay / 1000} seconds to allow the indexer to update before our GraphQL query.`);
          await sleep(delay);

          // Fetch proposal data (await needed)
          let eventData;
          try {
            const data = await this.proposalUpdateService.getProposalAddedEventByHash(txn.transactionHash);
            eventData = {
              data: {
                proposalId: data?.proposalId,
                proposalType: data?.proposalType,
                proposedWallet: data?.data
              }
            };
          } catch (error) {
            eventData = { error: `WEBSOCKET: Failed to fetch proposal data from THE GRAPH for transaction: ${txn.transactionHash}` };
            this.logger.error(eventData.error);
          }

          this.logger.log(`THE GRAPH: Got the response before emitting event to DAO SERVICE: ${JSON.stringify(eventData)}`);

          // Update the transaction status
          const updatedTransaction = await this.transactionService.updateStatus(
            txn.transactionHash,
            JSON.stringify(eventData),
            TransactionConfirmationSource.ALCHEMY,
            1
          );

          // Emit updated proposal event
          if (updatedTransaction) {
            await this.proposalUpdateService.updateProposal({
              web3Status: 1,
              message: "New Member Proposal Placed Successfully.",
              ...eventData,
              blockNumber: txn.blockNumber,
              transactionHash: txn.transactionHash,
            });
            this.logger.log('WEBSOCKET: New member proposal transaction update event has been emitted and DB has been updated!');

          }

        } else {
          this.logger.warn('WEBSOCKET: proposalEndTopic is non-zero for ProposalCreated event.');
        }
        this.logger.log("WEBSOCKET: Starting Cron");
        this.startCronJob();
      } catch (err) {
        this.logger.error(`WEBSOCKET: Error handling ProposalAddedEvents: ${err.message}`, err.stack);
        this.startCronJob();
      }
    });
  }



}