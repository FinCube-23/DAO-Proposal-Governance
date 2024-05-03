import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProposalEntity } from './entities/proposal.entity';

@Injectable()
export class ProposalServiceService {
  constructor(
    @InjectRepository(ProposalEntity) private proposalRepository: Repository<ProposalEntity>,
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
}
