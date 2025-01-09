import { Injectable, Inject, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProposalEntity } from './entities/proposal.entity';
import axios from 'axios';

import { ClientProxy, RmqContext, Ctx } from '@nestjs/microservices';
import { ProposalDto, CreatedProposalDto, MessageEnvelopeDto, PendingTransactionDto } from './dto/proposal.dto';
import { firstValueFrom, timeout } from 'rxjs';
import { ResponseTransactionStatusDto } from 'src/shared/common/dto/response-transaction-status.dto';
import { TraceContextDto } from 'src/shared/common/dto/trace-context.dto';


@Injectable()
export class ProposalServiceService {
  public update_proposals: ProposalDto[];
  private readonly logger = new Logger(ProposalServiceService.name);
  constructor(
    @InjectRepository(ProposalEntity) private proposalRepository: Repository<ProposalEntity>,
    @Inject('PROPOSAL_SERVICE') private rabbitClient: ClientProxy
  ) {
    this.update_proposals = [];
  }

  private async getUserRole(sub: string): Promise<string> {
    try {
      const response = await axios.get(`http://user_management_api:3000/authentication/${sub}`);
      return response.data;
    } catch (error) {
      this.logger.log("Role of user not found");
      throw new UnauthorizedException("Role of user not found");;
    }
  }

  // 💬 MessagePattern expects a response | This is a publisher
  async create(proposal: Partial<ProposalEntity>, sub: string): Promise<ProposalEntity> {
    // Testing without auth
    // const role = await this.getUserRole(sub);
    // if (role != 'MFS') {
    //   this.logger.log("User does not have permission for role: " + role);
    //   throw new UnauthorizedException("User does not have permission");
    // }
    try {
      this.logger.log("New proposal placed: " + proposal.id);
      const new_proposal = this.proposalRepository.create(proposal);
      const pendingTrx = { "trx_hash": new_proposal.trx_hash, "proposer_address": new_proposal.proposer_address };
      await this.handlePendingProposal(pendingTrx);
      return this.proposalRepository.save(new_proposal);
    } catch (err) {
      this.logger.error("Error triggering queue-pending-proposal: " + err);
      throw new Error("Error triggering queue-pending-proposal");
    }
  }

  async findAllProposals(sub: string): Promise<any> {
    const role = await this.getUserRole(sub);
    if (role != 'MFS') {
      this.logger.error("User does not have permission for role: " + role);
      throw new UnauthorizedException("User does not have permission");
    }
    return this.proposalRepository.find();
  }

  // 💬 Publishing Message in the queue
  async handlePendingProposal(proposal: PendingTransactionDto): Promise<any> {
    this.logger.log("Triggering queue-pending-proposal for Transaction: " + proposal.trx_hash);
    // Convert Observable to Promise and await the response
    const messageResponse = await firstValueFrom(
      this.rabbitClient.send('queue-pending-proposal', proposal)
    );
    if (messageResponse.status == 'SUCCESS') {
      this.logger.log("New proposal Transaction Hash is stored at AUDIT-TRAIL-SERVICE where DB PK is : " + messageResponse.data.db_record_id);
      return messageResponse;
    } else {
      throw new Error(messageResponse.error?.message || 'Proposal processing failed');
    }
  }

  private mapToCreatedProposalDto(proposal: any): CreatedProposalDto {
    const dto = new CreatedProposalDto();
    dto.id = proposal.proposalId; // Assuming 'id' from the graph is the address
    dto.proposalId = proposal.proposalId;
    dto.proposer_address = proposal.proposer_address;
    dto.description = proposal.metadata || proposal.description; //TODO: Needs to be a seperate function while recieving
    dto.voteStart = proposal.voteStart;
    dto.voteEnd = proposal.voteEnd;
    dto.external_proposal = proposal.external_proposal;
    const transactionData = new ResponseTransactionStatusDto();
    transactionData.web3Status = 0;
    transactionData.message = proposal.description;
    transactionData.blockNumber = 0; // Assuming block number is 0 for now
    transactionData.transactionHash = proposal.trx_hash;
    dto.transaction_data = proposal.transaction_data || transactionData;
    return dto;
  }

  // 📡 Listening Event from Publisher
  handleCreatedProposalPlaced(proposal: CreatedProposalDto, @Ctx() context: RmqContext) {
    const createdProposal = this.mapToCreatedProposalDto(proposal);
    if (
      createdProposal instanceof CreatedProposalDto
    ) {
      this.logger.log(
        `Received a proposal transaction update - hash: ${createdProposal.transaction_data.transactionHash}`,
      );
      console.log(`Pattern: ${context.getPattern()}`);
      this.update_proposals.push(createdProposal);
      const originalMsg = context.getMessage();
      console.log(originalMsg);
    } else {
      this.logger.error('Invalid proposal object received:', createdProposal);
    }
  }

  async findAll(sub: string): Promise<any> {
    const role = await this.getUserRole(sub);
    if (role != 'MFS') {
      this.logger.error("User does not have permission for role: " + role);
      throw new UnauthorizedException("User does not have permission");
    }
    return this.proposalRepository.find();
  }

}
