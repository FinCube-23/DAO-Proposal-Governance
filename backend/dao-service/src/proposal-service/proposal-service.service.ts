import { Injectable, Inject, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProposalEntity } from './entities/proposal.entity';
import axios from 'axios';

import { ClientProxy } from '@nestjs/microservices';
import { ProposalDto } from './dto/proposal.dto';
import { timeout } from 'rxjs';


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

  handleProposalPlaced(proposal: ProposalDto) {
    const new_proposal = new ProposalDto();
    new_proposal.id = proposal.id;
    new_proposal.proposalAddress = proposal.proposalAddress;
    new_proposal.external_proposal = proposal.external_proposal;
    new_proposal.metadata = proposal.metadata;
    new_proposal.proposer_address = proposal.proposer_address;
    new_proposal.proposal_status = proposal.proposal_status;
    if (new_proposal instanceof ProposalDto) {
      console.log(
        `Received a new proposal - Address: ${new_proposal.proposalAddress}`,
      );
      this.update_proposals.push(new_proposal);
      console.log("Received a new proposal and pushed");
    } else {
      console.error('Invalid proposal object received:', proposal);
    }
  }

  async getUpdatedProposals():Promise<any> {
    console.log("in get updated proposal of service");
    return this.update_proposals;
  }

}
