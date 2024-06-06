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
  constructor(
    @InjectRepository(ProposalEntity) private proposalRepository: Repository<ProposalEntity>,
    @Inject('PROPOSAL_SERVICE') private rabbitClient: ClientProxy
  ) { }
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
    return this.rabbitClient
      .send({ cmd: 'fetch-proposal' }, {})
      .pipe(timeout(5000));
  }

}
