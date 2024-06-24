import { Injectable, Inject, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProposalEntity } from './entities/proposal.entity';
import axios from 'axios';

import { ClientProxy } from '@nestjs/microservices';
import { ProposalDto, UpdatedProposalDto, CreatedProposalDto } from './dto/proposal.dto';
import { timeout } from 'rxjs';
import { ResponseTransactionStatusDto } from 'src/shared/common/dto/response-transaction-status.dto';


@Injectable()
export class ProposalServiceService {
  public update_proposals: ProposalDto[];
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
      throw new UnauthorizedException("Role of user not found");;
    }
  }
  async create(proposal: Partial<ProposalEntity>, sub: string): Promise<ProposalEntity> {
    const role = await this.getUserRole(sub);
    console.log(role);
    if (role != 'MFS') {
      throw new UnauthorizedException("User does not have permission");
    }
    const new_proposal = this.proposalRepository.create(proposal);
    return this.proposalRepository.save(new_proposal);
  }


  async findOne(id: number, sub: string): Promise<any> {
    const role = await this.getUserRole(sub);
    console.log(role);
    if (role != 'MFS') {
      throw new UnauthorizedException("User does not have permission");
    }
    return this.proposalRepository.find({
      where: {
        dao: { id: id }
      }
    });
  }

  placeProposal(proposal: ProposalDto) {
    this.rabbitClient.emit('proposal-placed', proposal);
    return { message: 'Proposal Placed!' };
  }

  getProposals() {
    console.log("in get proposal of service");
    return this.rabbitClient
      .send({ cmd: 'fetch-update-proposal' }, {})
      .pipe(timeout(5000));
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

  handleCreatedProposalPlaced(proposal: CreatedProposalDto) {
    console.log(proposal);
    const createdProposal = this.mapToCreatedProposalDto(proposal);
    if (
      createdProposal instanceof CreatedProposalDto
    ) {
      console.log(
        `Received a new proposal - Address: ${createdProposal.proposalAddress}`,
      );
      this.update_proposals.push(createdProposal);
    } else {
      console.log('Invalid proposal object received:', createdProposal);
    }
  }

  handleUpdatedProposalPlaced(proposal: UpdatedProposalDto) {
    console.log(proposal);
    const updatedProposal = this.mapToUpdatedProposalDto(proposal);
    if (
      updatedProposal instanceof UpdatedProposalDto
    ) {
      console.log(
        `Received a new proposal - Address: ${updatedProposal.proposalAddress}`,
      );
      this.update_proposals.push(updatedProposal);
    } else {
      console.log('Invalid proposal object received:', updatedProposal);
    }
  }


  async getUpdatedProposals():Promise<any> {
    console.log("in get updated proposal of service");
    return this.update_proposals;
  }

  async findAll(sub: string): Promise<any> {
    const role = await this.getUserRole(sub);
    console.log(role);
    if (role != 'MFS') {
      throw new UnauthorizedException("User does not have permission");
    }
    return this.proposalRepository.find();
  }

}
