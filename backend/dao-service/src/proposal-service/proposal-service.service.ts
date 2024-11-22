import { Injectable, Inject, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProposalEntity } from './entities/proposal.entity';
import axios from 'axios';

import { ClientProxy, RmqContext, Ctx } from '@nestjs/microservices';
import { ProposalDto, CreatedProposalDto, MessageEnvelopeDto, PendingTransactionDto } from './dto/proposal.dto';
import { timeout } from 'rxjs';
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

    this.logger.log("New proposal placed: " + proposal.id);
    const new_proposal = this.proposalRepository.create(proposal);
    const pending_proposal = this.mapToCreatedProposalDto(proposal);
    const envelop = this.mapCreatedProposalToMessageEnvelop(pending_proposal);
    try {
      this.logger.log("Triggering queue-pending-proposal for: Transaction: " + envelop.payload.trx_hash);
      this.rabbitClient.send('queue-pending-proposal', envelop);
    } catch (err) {
      this.logger.error("Error triggering queue-pending-proposal: " + err);
      throw new Error("Error triggering queue-pending-proposal");
    }

    return this.proposalRepository.save(new_proposal);
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
  handlePendingProposal(proposal: PendingTransactionDto): any {
    const envelop = this.mapToMessageEnvelopDto(proposal);
    this.logger.log("Triggering queue-pending-proposal for: Transaction: " + envelop.payload.trx_hash);
    return this.rabbitClient.send('queue-pending-proposal', proposal);
  }

  private mapCreatedProposalToMessageEnvelop(pendingProposal: CreatedProposalDto): MessageEnvelopeDto {
    const dto = new MessageEnvelopeDto();
    const trace_context = new TraceContextDto();
    trace_context.trace_id = "provided-by-api-gateway-service";
    trace_context.span_id = "api-service+this-service";
    dto.trace_context = trace_context;
    const payload = new PendingTransactionDto();
    payload.trx_hash = pendingProposal.transaction_data.transactionHash;
    payload.trx_singer = pendingProposal.proposer_address;
    dto.payload = payload;
    return dto;
  }
  private mapToMessageEnvelopDto(proposal: PendingTransactionDto): MessageEnvelopeDto {
    const dto = new MessageEnvelopeDto();
    const trace_context = new TraceContextDto();
    trace_context.trace_id = "provided-by-api-gateway-service";
    trace_context.span_id = "api-service+this-service";
    dto.trace_context = trace_context;
    const payload = new PendingTransactionDto();
    payload.trx_hash = proposal.trx_hash;
    payload.trx_singer = proposal.trx_singer;
    dto.payload = payload;
    return dto;
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
        `Received a new proposal - id: ${createdProposal.proposalId}`,
      );
      console.log(`Pattern: ${context.getPattern()}`);
      this.update_proposals.push(createdProposal);
      const originalMsg = context.getMessage();
      console.log(originalMsg);
    } else {
      this.logger.error('Invalid proposal object received:', createdProposal);
    }
  }

  async getUpdatedProposals(): Promise<any> {
    this.logger.error("in get updated proposal of service");
    return this.update_proposals;
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
