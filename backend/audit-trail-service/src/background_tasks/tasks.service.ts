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
    const proposalTopic = "0x3cd05952bf89447515ba76534b26df87104c2ba104027f22a518d767243973c1";// process.env.PROPOSAL_TOPIC;
    const proposalEndTopic =  "0x0000000000000000000000000000000000000000000000000000000000000000";// process.env.PROPOSAL_END_TOPIC;
    const daoContractAddress = "0x64D8506e96788aF3eb8110FEa4222E6eA8114Db9";// process.env.DAO_CONTRACT_ADDRESS;

    // Create the log options object.
    const ProposalCreatedEvents = {
        address: daoContractAddress,
        topics: [proposalTopic, proposalEndTopic],
    };

    // Open the websocket and listen for events!
    alchemy.ws.on(ProposalCreatedEvents, (txn) => {
        const eventObj = txn;
        this.logger.log(`New Proposal Creation is successful. Transaction Hash: ${txn.transactionHash}`);
        this.logger.log(`proposalEndTopic Value: ${txn.topics[1] }`);
        const isProposalEndTopicZero = txn.topics[1] === proposalEndTopic;
        if (isProposalEndTopicZero) {
            this.logger.log('proposalEndTopic is zero for ProposalCreated event.');
        } else {
            this.logger.log('proposalEndTopic is non-zero for ProposalCreated event.');
        }
    });
  }

}