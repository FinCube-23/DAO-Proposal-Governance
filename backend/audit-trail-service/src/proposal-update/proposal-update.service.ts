import {
  CreatedProposalDto, MessageEnvelopeDto, ProposeEnvelopeDto
} from './dto/proposal-update.dto';
import {
  Injectable,
  Inject,
  Logger,
} from '@nestjs/common';
import { ClientProxy, Ctx, RmqContext } from '@nestjs/microservices';
import { ProposalUpdateRepository } from './proposal-update.repository';


@Injectable()
export class ProposalUpdateService {
  private readonly logger = new Logger(ProposalUpdateService.name);
  public update_proposals: (CreatedProposalDto)[];

  constructor(
    @Inject('PROPOSAL_UPDATE_SERVICE') private rabbitClient: ClientProxy,
    private readonly proposalUpdateRepository: ProposalUpdateRepository,
  ) {
    this.update_proposals = [];
  }

  // 📡 Listening MessagePattern Call
  async handlePendingProposal(data_packet: MessageEnvelopeDto, @Ctx() context: RmqContext): Promise<string> {
    this.logger.log("Got the pending proposal hash " + data_packet.payload.trx_hash);
    this.logger.log("Trace id: " + data_packet.trace_context.trace_id + " | Span id: " + data_packet.trace_context.span_id);
    // @Sampad insert the transaction hash to DB.
    const new_dao_audit = {
      transactionHash: data_packet.payload.trx_hash,
      trx_sender: data_packet.payload.trx_singer,
    };

    //ToDo
    //this.daoAuditService.create(new_dao_audit);

    // Get pending proposal from The Graph
    const pendingProposal = await this.proposalUpdateRepository.getProposalsCreateds(data_packet.payload.trx_hash);
    this.logger.log("Recieved pending proposal: " + pendingProposal[0])
    const originalMsg = context.getMessage();
    const replyTo = originalMsg.properties.replyTo;
    this.logger.log('Replying To Producer Service: ' + replyTo);
    return "0xSuccess";
  }

  // 💬 Pushing Event in the Message Queue in EventPattern
  async updateProposal(proposal: CreatedProposalDto) {
    // const envelope = new ProposeEnvelopeDto();
    const envelope = await this.proposalUpdateRepository.getProposalsAdded(proposal.transaction_data.transactionHash);
    const gg = await this.mapToMessageEnvelopDto(envelope);  // For testing...
    proposal = gg.payload;
    await this.rabbitClient.emit('create-proposal-placed', proposal);
    return { message: 'Proposal Placed!' };
  }

  // async getProposalsForTest(transactionHash: string): Promise<any> {
  //   const proposals = await this.proposalUpdateRepository.getProposalsAdded(transactionHash);
  //   return proposals;
  // }
  getUpdatedProposals() {
    return this.update_proposals;
  }

  private async mapToMessageEnvelopDto(proposal: any): Promise<ProposeEnvelopeDto> {
    const dto = new ProposeEnvelopeDto();

    // Initialize nested objects first
    dto.event_data = {
      event_name: "pattern",
      published_at: new Date(),
      publisher_service: 'audit-trail-service'
    };

    dto.trace_context = {
      trace_id: "CRON-JOB-GENERATED",
      span_id: "audit-trail-service(uuid)+dao-service(uuid)"
    };

    dto.payload = {
      id: proposal?.id || '0xSample-Index',
      proposalId: proposal?.proposalId || '34',
      transaction_data: {
        blockNumber: proposal?.blockNumber || 786,
        web3Status: 0,
        transactionHash: proposal?.transactionHash || '0xtrxHash',
        message: 'Test Packet',
      },
      proposer_address: proposal?.proposer || '0xWallet',
      voteStart: proposal?.voteStart || '171963',
      voteEnd: proposal?.voteEnd || '25339',
      description: proposal?.description || 'This is a test proposal',
      external_proposal: false,
    };

    return dto;
  }

  // private async mapToMessageEnvelopDto(proposal: any): Promise<ProposeEnvelopeDto> {
  //   const dto = new ProposeEnvelopeDto();
  //   dto.event_data.event_name = "pattern";
  //   dto.event_data.published_at = new Date();
  //   dto.event_data.publisher_service = 'audit-trail-service';
  //   dto.trace_context.trace_id = "CRON-JOB-GENERATED";
  //   dto.trace_context.span_id = "audit-trail-service(uuid)+dao-service(uuid)";
  //   dto.payload.id = proposal.id
  //   dto.payload.proposalId = proposal.proposalId;
  //   dto.payload.transaction_data.blockNumber = proposal.blockNumber;
  //   dto.payload.transaction_data.web3Status = 0;
  //   dto.payload.transaction_data.transactionHash = proposal.transactionHash;
  //   dto.payload.proposer_address = proposal.proposer;
  //   dto.payload.voteStart = proposal.voteStart;
  //   dto.payload.voteEnd = proposal.voteEnd;
  //   dto.payload.description = proposal.description;
  //   return dto;
  // }

}
