import { ProposalUpdateDto } from './dto/proposal-update.dto';
import axios from 'axios';

import { ApolloClient, gql } from '@apollo/client';
import {
  Injectable,
  Inject,
  NotFoundException,
  UnauthorizedException, Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { timeout } from 'rxjs';

@Injectable()
export class ProposalUpdateService {
  private readonly logger = new Logger(ProposalUpdateService.name);
  public update_proposals: ProposalUpdateDto[];

  constructor(
    @Inject('PROPOSAL_UPDATE_SERVICE') private rabbitClient: ClientProxy,
    @Inject('APOLLO_CLIENT1') private apolloClient: ApolloClient<any>,
  ) {
    this.update_proposals = [];
  }

  placeProposal(proposal: ProposalUpdateDto) {
    console.log('in service placeProposal');
    this.rabbitClient.emit('update-proposal-placed', proposal);
    console.log('in service placeProposal emitted');
    return { message: 'Proposal Placed!' };
  }

  getProposals() {
    return this.rabbitClient
      .send({ cmd: 'fetch-proposal' }, {})
      .pipe(timeout(5000));
  }

  handleProposalPlaced(proposal: ProposalUpdateDto) {
    const new_proposal = new ProposalUpdateDto();
    new_proposal.id = proposal.id;
    new_proposal.proposalAddress = proposal.proposalAddress;
    new_proposal.external_proposal = proposal.external_proposal;
    new_proposal.metadata = proposal.metadata;
    new_proposal.proposer_address = proposal.proposer_address;
    new_proposal.transaction_info = proposal.transaction_info;
    if (new_proposal instanceof ProposalUpdateDto) {
      console.log(
        `Received a new proposal - Address: ${new_proposal.proposalAddress}`,
      );
      this.update_proposals.push(new_proposal);
    } else {
      console.log('Invalid proposal object received:', proposal);
    }
  }

  getUpdatedProposals() {
    return this.update_proposals;
  }

  //GETTING PROPOSAL RELATED EVENTS
  GET_PROPOSAL_CREATED = gql`
    query MyQuery {
      proposalCreateds {
        id
        proposalId
        proposalType
        transactionHash
        data
        blockTimestamp
      }
    }
  `;

  GET_PROPOSAL_EXECUTED = gql`
    query MyQuery {
      proposalCreateds {
        id
        proposalId
        proposalType
        transactionHash
        data
        blockTimestamp
      }
    }
  `;

  GET_PROPOSAL_CANCELED = gql`
    query MyQuery {
      proposalCreateds {
        id
        proposalId
        proposalType
        transactionHash
        data
        blockTimestamp
      }
    }
  `;
  async getProposalsCreated(): Promise<any> {
    try {
      this.logger.log('Fetching created proposals');

      const result = await this.apolloClient.query({
        query: this.GET_PROPOSAL_CREATED,
      });
      return result.data.proposalCreateds;
    } catch (error) {
      this.logger.error('Error fetching created proposals:', error);
      throw error;
    }
  }

  async getProposalsExecuted(): Promise<any> {
    try {
      this.logger.log('Fetching executed proposals');

      const result = await this.apolloClient.query({
        query: this.GET_PROPOSAL_EXECUTED,
      });
      return result.data.proposalExecuteds;
    } catch (error) {
      this.logger.error('Error fetching executed proposals:', error);
      throw error;
    }
  }

  async getProposalsCanceled(): Promise<any> {
    try {
      this.logger.log('Fetching canceled proposals');

      const result = await this.apolloClient.query({
        query: this.GET_PROPOSAL_CANCELED,
      });
      return result.data.proposalCanceleds;
    } catch (error) {
      this.logger.error('Error fetching canceled proposals:', error);
      throw error;
    }
  }
}
