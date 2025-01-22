import { Injectable, Logger } from '@nestjs/common';
import { ProposalUpdateService } from 'src/proposal-update/proposal-update.service';
import { TransactionsService } from 'src/transactions/transactions.service';

require('dotenv').config();
const { Network, Alchemy } = require("alchemy-sdk");

const settings = {
  apiKey: process.env.AMOY_API_KEY,
  network: Network.MATIC_AMOY,
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

  listenProposalTrx() {
    const proposalTopic = process.env.PROPOSAL_TOPIC;
    const proposalEndTopic = process.env.PROPOSAL_END_TOPIC;
    const daoContractAddress = process.env.DAO_CONTRACT_ADDRESS;

    // Create the log options object.
    const ProposalAddedEvents = {
      address: daoContractAddress,
      topics: [proposalTopic, proposalEndTopic],
    };

    // Open the websocket and listen for events!
    alchemy.ws.on(ProposalAddedEvents, (txn) => {
      this.logger.log(`New Proposal Creation is successful. Transaction Hash: ${txn.transactionHash}`);
      this.logger.log(`proposalEndTopic Value: ${txn.topics[1]}`);
      console.log(JSON.stringify(txn, null, 2));
      console.dir(txn, { depth: null });
      const isProposalEndTopicZero = txn.topics[1] === proposalEndTopic;
      if (isProposalEndTopicZero) {
        this.logger.log('proposalEndTopic is zero for ProposalCreated event.');
        this.logger.log('New member proposal placed at on-chain.');
        // Updating Audit DB Transaction Status
        this.transactionService.updateStatus(txn.transactionHash, 1);
        const eventData = this.proposalUpdateService.getProposalAddedEventByHash(txn.transactionHash)
        .then(data => ({ data: { proposalId: data?.proposalId, proposalType: data?.proposalType } }))
        .catch(() => ({ error: `Failed to fetch proposal data from THR GRAPH for transaction: ${txn.transactionHash}` }));
        // Emitting Transaction Status to other Services
        this.proposalUpdateService.updateProposal({
          "web3Status": 1,
          "message": "New Member Proposal Placed Successfully.",
          ...eventData,
          "blockNumber": txn.blockNumber,
          "transactionHash": txn.transactionHash
        });
        this.logger.log('New member proposal transaction update event nas been emitted and DB has been updated!');
      } else {
        this.logger.warn('proposalEndTopic is non-zero for ProposalCreated event.');
      }
    });
  }

}