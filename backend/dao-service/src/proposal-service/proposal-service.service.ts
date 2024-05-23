import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProposalEntity } from './entities/proposal.entity';
import axios from 'axios';

@Injectable()
export class ProposalServiceService {
  constructor(
    @InjectRepository(ProposalEntity) private proposalRepository: Repository<ProposalEntity>,
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
}
