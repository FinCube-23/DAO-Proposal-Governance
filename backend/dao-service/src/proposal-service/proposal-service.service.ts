import { Injectable, Inject, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProposalEntity } from './entities/proposal.entity';
import axios from 'axios';

import { ClientProxy, RmqContext, Ctx } from '@nestjs/microservices';
import { ProposalDto, CreatedProposalDto } from './dto/proposal.dto';
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
    this.logger.log("Triggering queue-pending-proposal for: Transaction: "+ proposal.transaction_data.transactionHash);
    return this.rabbitClient.send('queue-pending-proposal', proposal);
  }

  private mapToCreatedProposalDto(proposal: any): CreatedProposalDto {
    const dto = new CreatedProposalDto();
    dto.id = proposal.proposalId; // Assuming 'id' from the graph is the address
    dto.proposalId = proposal.proposalId; 
    dto.description = proposal.description; 
    dto.voteStart = proposal.voteStart;
    dto.voteEnd = proposal.voteEnd;
    dto.external_proposal = proposal.external_proposal; 
    dto.transaction_data = proposal.transaction_data as unknown as ResponseTransactionStatusDto;
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
