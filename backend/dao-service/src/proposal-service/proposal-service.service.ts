import { Injectable, Inject, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProposalEntity } from './entities/proposal.entity';
import axios from 'axios';

import { ClientProxy, RmqContext, Ctx } from '@nestjs/microservices';
import { ProposalDto, UpdatedProposalDto, CreatedProposalDto } from './dto/proposal.dto';
import { timeout } from 'rxjs';
import { ResponseTransactionStatusDto } from 'src/shared/common/dto/response-transaction-status.dto';


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
  async create(proposal: Partial<ProposalEntity>, sub: string): Promise<ProposalEntity> {
    const role = await this.getUserRole(sub);
    if (role != 'MFS') {
      this.logger.log("User does not have permission for role: " + role);
      throw new UnauthorizedException("User does not have permission");
    }
    const new_proposal = this.proposalRepository.create(proposal);
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

  placeProposal(proposal: ProposalDto) {
    return { message: 'Proposal Placed!' };
  }

  // 💬 Publishing Message in the queue
  handlePendingProposal(proposal: CreatedProposalDto): any {
    this.logger.log("Triggering queue-pending-proposal for: Transaction: "+ proposal.transaction_info.transactionHash);
    return this.rabbitClient.send('queue-pending-proposal', proposal);
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
      status: 'PENDING', 
    } as unknown as ResponseTransactionStatusDto;
    dto.external_proposal = true; 
    return dto;
  }

  private mapToUpdatedProposalDto(proposal: any): UpdatedProposalDto {
    const dto = new UpdatedProposalDto();
    dto.id = proposal.proposalId;
    dto.proposalAddress = proposal.id;
    dto.transaction_info = {
      transactionHash: proposal.transactionHash,
      status: 'PENDING', 
    } as unknown as ResponseTransactionStatusDto;
    return dto;
  }

  // 📡 Listening Event from Publisher
  handleCreatedProposalPlaced(proposal: CreatedProposalDto, @Ctx() context: RmqContext) {
    const createdProposal = this.mapToCreatedProposalDto(proposal);
    if (
      createdProposal instanceof CreatedProposalDto
    ) {
      this.logger.log(
        `Received a new proposal - Address: ${createdProposal.proposalAddress}`,
      );
      console.log(`Pattern: ${context.getPattern()}`);
      this.update_proposals.push(createdProposal);
      const originalMsg = context.getMessage();
      console.log(originalMsg);
    } else {
      this.logger.error('Invalid proposal object received:', createdProposal);
    }
  }

  // 📡 Listening Event from Publisher
  handleUpdatedProposalPlaced(proposal: UpdatedProposalDto) {
    const updatedProposal = this.mapToUpdatedProposalDto(proposal);
    if (
      updatedProposal instanceof UpdatedProposalDto
    ) {
      this.logger.error(
        `Received a new proposal - Address: ${updatedProposal.proposalAddress}`,
      );
      this.update_proposals.push(updatedProposal);
    } else {
      this.logger.error('Invalid proposal object received:', updatedProposal);
    }
  }

  async getUpdatedProposals():Promise<any> {
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
