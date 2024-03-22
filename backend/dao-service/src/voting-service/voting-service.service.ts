import { Injectable } from '@nestjs/common';
import { CreateVotingServiceDto } from './dto/create-voting-service.dto';
import { UpdateVotingServiceDto } from './dto/update-voting-service.dto';

@Injectable()
export class VotingServiceService {
  create(createVotingServiceDto: CreateVotingServiceDto) {
    return 'This action adds a new votingService';
  }

  findAll() {
    return `This action returns all votingService`;
  }

  findOne(id: number) {
    return `This action returns a #${id} votingService`;
  }

  update(id: number, updateVotingServiceDto: UpdateVotingServiceDto) {
    return `This action updates a #${id} votingService`;
  }

  remove(id: number) {
    return `This action removes a #${id} votingService`;
  }
}
