import {
  CreatedProposalDto, MessageEnvelopeDto, PendingTransactionDto, ProposeEnvelopeDto, MessageResponse
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
  async handlePendingProposal(data_packet: PendingTransactionDto, @Ctx() context: RmqContext): Promise<MessageResponse> {
    this.logger.log("Got the pending proposal hash " + data_packet.trx_hash);
    try {
      const new_dao_audit = {
        transactionHash: data_packet.trx_hash,
        trx_sender: data_packet.proposer_address,
      };
      const originalMsg = context.getMessage();
      const replyTo = originalMsg.properties.replyTo;
      this.logger.log('Replying To Producer Service: ' + replyTo);
      // Return properly structured response with dummy values
      return {
        status: 'SUCCESS',
        message_id: data_packet.trx_hash, // Should use trace_id as message_id for now
        timestamp: new Date().toISOString(),
        data: {
          db_record_id: 123, // Dummy value until ORM is integrated
          current_status: 'INDEXING'
        }
      };
    }
    catch (error) {
      this.logger.error('Error processing pending proposal:', {
        error: error.message,
        transactionHash: data_packet?.trx_hash
      });
      return {
        status: 'FAILED',
        message_id: data_packet?.trx_hash || 'unknown',
        timestamp: new Date().toISOString(),
        data: {
          db_record_id: 0,
          current_status: 'UNKNOWN'
        },
        error: {
          code: 'PROCESSING_ERROR',
          message: error.message,
          details: {
            transactionHash: data_packet?.trx_hash,
            errorStack: error.stack
          }
        }
      };
    }
  }

  // 💬 Pushing Event in the Message Queue in EventPattern
  async updateProposal(proposal: CreatedProposalDto) {
    await this.rabbitClient.emit('create-proposal-placed', proposal);
    return { message: 'Proposal on-chain status update notified to DAO-SERVICE!' };
  }

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

}
