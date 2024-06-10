import { ProposalUpdateDto } from './dto/proposal-update.dto';
import axios from 'axios';
import {
  Injectable,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { timeout } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProposalUpdateService {
  public update_proposals: ProposalUpdateDto[];
  constructor(
    @Inject('PROPOSAL_UPDATE_SERVICE') private rabbitClient: ClientProxy,
  ) {}
  private async getUserRole(sub: string): Promise<string> {
    try {
      const response = await axios.get(`http://user_management_api:3000/authentication/${sub}`);
      return response.data;
    } catch (error) {
      throw new UnauthorizedException("Role of user not found");;
    }
  }


  placeProposal(proposal: ProposalUpdateDto) {
    console.log("in service placeProposal");
    this.rabbitClient.emit('update-proposal-placed', proposal);
    console.log("in service placeProposal emitted");
    return { message: 'Proposal Placed!' };
  }

  getProposals() {
    return this.rabbitClient
      .send({ cmd: 'fetch-proposal' }, {})
      .pipe(timeout(5000));
  }

  handleProposalPlaced(proposal: ProposalUpdateDto) {
    const new_proposal = new ProposalUpdateDto();
    new_proposal.id = proposal.id;
    new_proposal.proposalAddress = proposal.proposalAddress;
    new_proposal.external_proposal = proposal.external_proposal;
    new_proposal.metadata = proposal.metadata;
    new_proposal.proposer_address = proposal.proposer_address;
    new_proposal.transaction_info = proposal.transaction_info;
    if (new_proposal instanceof ProposalUpdateDto) {
      console.log(
        `Received a new proposal - Address: ${new_proposal.proposalAddress}`,
      );
      this.update_proposals.push(new_proposal);
    } else {
      console.log('Invalid proposal object received:', proposal);
    }
  }

  getUpdatedProposals() {
    return this.update_proposals;
  }
}
