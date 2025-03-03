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
import { TransactionsService } from 'src/transactions/transactions.service';
import { ResponseTransactionStatusDto } from 'src/shared/common/dto/response-transaction-status.dto';


@Injectable()
export class ProposalUpdateService {
  private readonly logger = new Logger(ProposalUpdateService.name);
  public update_proposals: (CreatedProposalDto)[];

  constructor(
    @Inject('PROPOSAL_UPDATE_SERVICE') private rabbitClient: ClientProxy,
    private transactionService: TransactionsService,
    private readonly proposalUpdateRepository: ProposalUpdateRepository,
  ) {
    this.update_proposals = [];
  }

  // 📡 Listening MessagePattern Call
  async handlePendingProposal(data_packet: PendingTransactionDto, @Ctx() context: RmqContext): Promise<MessageResponse> {
    this.logger.log("Got the pending proposal hash " + data_packet.trx_hash);
    try {
      const new_dao_audit = {
        "trx_hash": data_packet.trx_hash,
        "trx_sender": data_packet.proposer_address,
        "trx_status": 0
      };
      const dbRecordedTRX = await this.transactionService.create(new_dao_audit);
      const originalMsg = context.getMessage();
      const replyTo = originalMsg.properties.replyTo;
      this.logger.log('Replying To Producer Service: ' + replyTo);
      // Return properly structured response with dummy values
      return {
        status: 'SUCCESS',
        message_id: data_packet.trx_hash, // Should use trace_id as message_id for now
        timestamp: new Date().toISOString(),
        data: {
          db_record_id: dbRecordedTRX.id,
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
  // 📡 Listening MessagePattern Call (New Function)
  async handleUpdatedTransaction(data_packet: PendingTransactionDto, @Ctx() context: RmqContext): Promise<MessageResponse> {
    this.logger.log("Got a new transaction hash " + data_packet.trx_hash);
    try {
      const new_dao_audit = {
        "trx_hash": data_packet.trx_hash,
        "trx_sender": data_packet.proposer_address,
        "trx_status": 0
      };

      const dbRecordedTRX = await this.transactionService.create(new_dao_audit);
      const originalMsg = context.getMessage();
      const replyTo = originalMsg.properties.replyTo;
      this.logger.log('Replying To Producer Service: ' + replyTo);
      // Return properly structured response with dummy values
      return {
        status: 'SUCCESS',
        message_id: data_packet.trx_hash, // Should use trace_id as message_id for now
        timestamp: new Date().toISOString(),
        data: {
          db_record_id: dbRecordedTRX.id,
          current_status: 'INDEXING'
        }
      };
    }
    catch (error) {
      this.logger.error('Error processing pending transaction:', {
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
  async updateProposal(proposal: ResponseTransactionStatusDto) {
    await this.rabbitClient.emit('create-proposal-placed', proposal);
    return { message: 'Proposal on-chain status update notified to DAO-SERVICE!' };
  }


  // 💬 Pushing Event in the Message Queue in EventPattern
  async updatedTransaction(proposal: ResponseTransactionStatusDto) {
    await this.rabbitClient.emit('update-transaction-event', proposal);
    return { message: 'Proposal on-chain status update notified to DAO-SERVICE!' };
  }

  async getProposalAddedEventByHash(trx_hash: string): Promise<any> {
    return await this.proposalUpdateRepository.getProposalsAdded(trx_hash);
  }

  async getTransactionUpdates(trx_hashes: string[]): Promise<any> {
    return await this.proposalUpdateRepository.getTransactionsUpdated(trx_hashes);
  }

}
