import {
  CreatedProposalDto,
  UpdatedProposalDto,
} from './dto/proposal-update.dto';
import axios from 'axios';
import { ResponseTransactionStatusDto } from 'src/shared/common/dto/response-transaction-status.dto';
import { ApolloClient, gql } from '@apollo/client';
import {
  Injectable,
  Inject,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { timeout } from 'rxjs';

@Injectable()
export class ProposalUpdateService {
  private readonly logger = new Logger(ProposalUpdateService.name);
  public update_proposals: (CreatedProposalDto | UpdatedProposalDto)[];

  constructor(
    @Inject('PROPOSAL_UPDATE_SERVICE') private rabbitClient: ClientProxy,
    @Inject('APOLLO_CLIENT1') private apolloClient: ApolloClient<any>,
  ) {
    this.update_proposals = [];
  }

  placeProposal(proposal: CreatedProposalDto) {
    console.log('in service placeProposal');
    this.rabbitClient.emit('create-proposal-placed', proposal);
    console.log('in service placeProposal emitted');
    return { message: 'Proposal Placed!' };
  }

  updateProposal(proposal : UpdatedProposalDto) {
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

  handleProposalPlaced(proposal: CreatedProposalDto | UpdatedProposalDto) {
    if (
      proposal instanceof CreatedProposalDto ||
      proposal instanceof UpdatedProposalDto
    ) {
      console.log(
        `Received a new proposal - Address: ${proposal.proposalAddress}`,
      );
      this.update_proposals.push(proposal);
    } else {
      console.log('Invalid proposal object received:', proposal);
    }
  }

  getUpdatedProposals() {
    return this.update_proposals;
  }

  private mapToCreatedProposalDto(proposal: any): CreatedProposalDto {
    const dto = new CreatedProposalDto();
    dto.id = proposal.proposalId;
    dto.proposalAddress = proposal.id; // Assuming 'id' from the graph is the address
    dto.proposer_address = ''; // This information is not available in the current graph data
    dto.metadata = JSON.stringify({
      blockTimestamp: proposal.blockTimestamp,
      proposalType: proposal.proposalType,
    });
    dto.transaction_info = {
      transactionHash: proposal.transactionHash,
      status: 'PENDING', // You might want to adjust this based on your needs
    } as unknown as ResponseTransactionStatusDto;
    dto.external_proposal = true; // Assuming all proposals from the graph are external
    return dto;
  }

  private mapToUpdatedProposalDto(proposal: any): UpdatedProposalDto {
    const dto = new UpdatedProposalDto();
    dto.id = proposal.proposalId;
    dto.proposalAddress = proposal.id;
    dto.transaction_info = {
      transactionHash: proposal.transactionHash,
      status: 'PENDING', // You might want to adjust this based on your needs
    } as unknown as ResponseTransactionStatusDto;
    return dto;
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
