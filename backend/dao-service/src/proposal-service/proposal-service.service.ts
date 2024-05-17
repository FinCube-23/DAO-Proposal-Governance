import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProposalEntity } from './entities/proposal.entity';

import { ClientProxy } from '@nestjs/microservices';
import { ProposalDto } from './dto/proposal.dto';


@Injectable()
export class ProposalServiceService {
  constructor(
    @InjectRepository(ProposalEntity) private proposalRepository: Repository<ProposalEntity>,
    @Inject('PROPOSAL_SERVICE') private rabbitClient: ClientProxy
  ) { }

  async create(proposal: Partial<ProposalEntity>): Promise<ProposalEntity> {
    const new_proposal = this.proposalRepository.create(proposal);
    return this.proposalRepository.save(new_proposal);
  }


  async findOne(id: number): Promise<any> {
    return this.proposalRepository.find({
      where: {
        dao: { id: id }
      }
    });
  }

  placeProposal(proposal: ProposalDto) {
    console.log(this.rabbitClient.emit('proposal-placed', proposal));
    return { message: 'Proposal Placed!' };
  }

}
