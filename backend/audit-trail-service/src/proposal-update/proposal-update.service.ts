import {
  CreatedProposalDto,
  UpdatedProposalDto,
} from './dto/proposal-update.dto';
import {
  Injectable,
  Inject,
  Logger,
} from '@nestjs/common';
import { ClientProxy, Ctx, RmqContext} from '@nestjs/microservices';
import { ProposalUpdateRepository } from './proposal-update.repository';

@Injectable()
export class ProposalUpdateService {
  private readonly logger = new Logger(ProposalUpdateService.name);
  public update_proposals: (CreatedProposalDto | UpdatedProposalDto)[];

  constructor(
    @Inject('PROPOSAL_UPDATE_SERVICE') private rabbitClient: ClientProxy,
    private readonly proposalUpdateRepository: ProposalUpdateRepository,
  ) {
    this.update_proposals = [];
  }

  // 📡 Listening MessagePattern Call
  handlePendingProposal(proposal: CreatedProposalDto, @Ctx() context: RmqContext): string {
    this.logger.log("Got the pending proposal hash " + proposal.transaction_info.transactionHash);
    const originalMsg = context.getMessage();
    const replyTo = originalMsg.properties.replyTo;
    this.logger.log('Replying To Producer Service: ' + replyTo);
    return "0xSuccess"
  }

  // 💬 Pushing Event in the Message Queue in EventPattern
  placeProposal(proposal: CreatedProposalDto) {
    this.rabbitClient.emit('create-proposal-placed', proposal);
    const sample = this.proposalUpdateRepository.getProposalsAdded();
    return { message: 'Proposal Placed!' };
  }

  // 💬 Pushing Event in the Message Queue in EventPattern
  updateProposal(proposal : UpdatedProposalDto) {
    this.rabbitClient.emit('update-proposal-placed', proposal);
    return { message: 'Proposal Placed!' };
  }

  getUpdatedProposals() {
    return this.update_proposals;
  }

}
