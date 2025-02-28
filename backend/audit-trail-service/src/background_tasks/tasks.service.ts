import { Injectable, Logger } from '@nestjs/common';
import { ProposalUpdateService } from 'src/proposal-update/proposal-update.service';
import { TransactionConfirmationSource } from 'src/transactions/entities/transaction.entity';
import { TransactionsService } from 'src/transactions/transactions.service';
import { Cron } from '@nestjs/schedule';

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

  constructor(
    private transactionService: TransactionsService,
    private proposalUpdateService: ProposalUpdateService,
  ) { }

  @Cron('30 * * * * *')
  async handleCron() {
    this.logger.log("Cron job started to look for pending transactions");
    //Get pending proposals from DB
    this.logger.log("Quering transactions from Transaction DB");

    const pendingTransactionHash = await this.transactionService.getPendingTransactionHash();

    this.logger.log(`This are the pending transaction hashes: ${pendingTransactionHash}`);

    //Query pending transactions (if any) from GraphQL
    this.logger.log(`Quering pending transactions from The Graph`);

    const pendingTransactions = await this.proposalUpdateService.getTransactionUpdates(pendingTransactionHash);

    if (!pendingTransactions || pendingTransactions.length === 0) {
      this.logger.log(`No pending transactions!`);
      return;
    }

    this.logger.log(`Found pending transactions: ${pendingTransactions}`);


    //These will be filtered at the later card #242



    //Update if there is any change in status first transaction service, then DAO service

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

    for (const transaction of uniqueTransactions) {
      try {
        await this.transactionService.updateStatus(
          transaction.transactionHash,
          transaction,
          TransactionConfirmationSource.THE_GRAPH,
          1
        );
        this.logger.log(`Transaction ${transaction.transactionHash} successfully updated.`);
      } catch (updateError) {
        this.logger.error(`Failed to update transaction ${transaction.transactionHash}: ${updateError.message}`);
      }
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
        this.logger.log(`New Proposal Creation is successful. Transaction Hash: ${txn.transactionHash}`);
        this.logger.log(`proposalEndTopic Value: ${txn.topics[1]}`);
        console.log(JSON.stringify(txn, null, 2));
        console.dir(txn, { depth: null });

        const isProposalEndTopicZero = txn.topics[1] === proposalEndTopic;

        if (isProposalEndTopicZero) {
          this.logger.log('proposalEndTopic is zero for ProposalCreated event.');
          this.logger.log('New member proposal transaction placed on-chain.');

          // Introduce a 30-second delay before fetching the data
          const delay = 30000; // 30 seconds
          this.logger.log(`Waiting for ${delay / 1000} seconds to allow the indexer to update before our GraphQL query.`);
          await sleep(delay);

          // Fetch proposal data (await needed)
          let eventData;
          try {
            const data = await this.proposalUpdateService.getProposalAddedEventByHash(txn.transactionHash);
            eventData = {
              data: {
                proposalId: data?.proposalId,
                proposalType: data?.proposalType
              }
            };
          } catch (error) {
            eventData = { error: `Failed to fetch proposal data from THE GRAPH for transaction: ${txn.transactionHash}` };
            this.logger.error(eventData.error);
          }

          this.logger.log(`THE GRAPH: Got the response before emitting event to DAO SERVICE: ${JSON.stringify(eventData)}`);

          // Update the transaction status
          await this.transactionService.updateStatus(txn.transactionHash, JSON.stringify(eventData), TransactionConfirmationSource.ALCHEMY, 1);

          // Emit updated proposal event
          await this.proposalUpdateService.updateProposal({
            web3Status: 1,
            message: "New Member Proposal Placed Successfully.",
            ...eventData,
            blockNumber: txn.blockNumber,
            transactionHash: txn.transactionHash,
          });

          this.logger.log('New member proposal transaction update event has been emitted and DB has been updated!');
        } else {
          this.logger.warn('proposalEndTopic is non-zero for ProposalCreated event.');
        }
      } catch (err) {
        this.logger.error(`Error handling ProposalAddedEvents: ${err.message}`, err.stack);
      }
    });
  }

}