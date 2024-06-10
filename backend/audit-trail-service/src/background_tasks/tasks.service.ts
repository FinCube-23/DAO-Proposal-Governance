import { Injectable, Logger } from '@nestjs/common';

require('dotenv').config();
const { Network, Alchemy } = require("alchemy-sdk");

const settings = {
  apiKey: process.env.SEPOLIA_API_KEY, 
  network: Network.ETH_SEPOLIA, 
};
// Ref: https://github.com/alchemyplatform/alchemy-sdk-js/blob/master/docs-md/enums/Network.md

const alchemy = new Alchemy(settings);

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor() {}

  listenProposalTrx(){
    const proposalTopic = process.env.PROPOSAL_TOPIC;
    const proposalEndTopic = process.env.PROPOSAL_END_TOPIC;
    const daoContractAddress = process.env.DAO_CONTRACT_ADDRESS;

    // Create the log options object.
    const ProposalCreatedEvents = {
        address: daoContractAddress,
        topics: [proposalTopic, proposalEndTopic],
    };

    // Open the websocket and listen for events!
    alchemy.ws.on(ProposalCreatedEvents, (txn) => {
        const eventObj = txn;
        this.logger.log(`New Proposal Creation is successful. Transaction Hash: ${txn.transactionHash}`);
    });
  }

}