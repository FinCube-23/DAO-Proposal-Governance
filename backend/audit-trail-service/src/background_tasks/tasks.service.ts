import { Injectable, Logger } from '@nestjs/common';
import { ProposalUpdateService } from 'src/proposal-update/proposal-update.service';
import { TransactionConfirmationSource } from 'src/transactions/entities/transaction.entity';
import { TransactionsService } from 'src/transactions/transactions.service';

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
                proposalType: data?.proposalType,
                proposedWallet: data?.data
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