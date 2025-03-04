import { Injectable, Inject, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProposalEntity } from './entities/proposal.entity';

import { ClientProxy, RmqContext, Ctx } from '@nestjs/microservices';
import { ProposalDto, PendingTransactionDto, PaginatedProposalResponse } from './dto/proposal.dto';
import { firstValueFrom, timeout } from 'rxjs';
import { ResponseTransactionStatusDto } from 'src/shared/common/dto/response-transaction-status.dto';
import { WinstonLogger } from 'src/shared/common/logger/winston-logger';


@Injectable()
export class ProposalServiceService {
  public update_proposals: ProposalDto[];
  constructor(
    @InjectRepository(ProposalEntity) private proposalRepository: Repository<ProposalEntity>,
    @Inject('PROPOSAL_SERVICE') private rabbitClient: ClientProxy,
    private readonly logger: WinstonLogger
  ) {
    this.logger.setContext(ProposalServiceService.name);
    this.update_proposals = [];
  }

  // 💬 MessagePattern expects a response | This is a publisher
  async create(proposal: Partial<ProposalEntity>, sub: string): Promise<ProposalEntity> {
    try {
      // First verify we have the required fields
      if (!proposal.trx_hash || !proposal.proposer_address) {
        throw new Error('Transaction hash and proposer address are required');
      }

      const pendingTrx = {
        trx_hash: proposal.trx_hash,
        proposer_address: proposal.proposer_address
      };

      // Handle pending proposal and get audit record from AUDIT TRAIL SERVICE
      const audit_record = await this.handlePendingProposal(pendingTrx);

      if (!audit_record?.data?.db_record_id) {
        throw new Error('Failed to get valid audit record ID');
      }

      // Updating new proposal with audit ID
      proposal.audit_id = audit_record.data.db_record_id;
      const new_proposal = this.proposalRepository.create(proposal);

      const saved_proposal = await this.proposalRepository.save(new_proposal);
      this.logger.log({
        timestamp: new Date().toISOString(),
        message: `New proposal created with ID: ${saved_proposal.id}`,
        wallet: proposal.proposer_address,
        proposalId: saved_proposal.id
      });

      return saved_proposal;

    } catch (err) {
      this.logger.error({
        timestamp: new Date().toISOString(),
        message: `Failed to create proposal: ${err.message}`,
        error: err.stack
      });
      this.logger.debug({
        timestamp: new Date().toISOString(),
        message: `Error details`,
        errorDetails: JSON.stringify(err)
      });
      throw new Error(`Failed to create proposal`);
    }
  }

  async findById(id: number): Promise<ProposalEntity> {
    const proposal = await this.proposalRepository.findOne({
      where: { id }
    });

    if (!proposal) {
      this.logger.warn(`Proposal with ID ${id} not found`);
      throw new NotFoundException(`Proposal with ID ${id} not found`);
    }

    return proposal;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<PaginatedProposalResponse> {
    // Calculate records to skip: e.g., page 3 with limit 10 = skip 20 records (returns records 21-30)
    const skip = (page - 1) * limit;

    const [proposals, total] = await this.proposalRepository
      .createQueryBuilder('proposal')
      .select([
        'proposal.id',
        'proposal.proposal_type',
        'proposal.proposer_address',
        'proposal.proposal_status'
      ])
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    this.logger.debug(`Found ${proposals.length} proposals out of ${total}`);

    return {
      data: proposals,
      total,
      page,
      limit
    };
  }

  // 💬 Publishing Message in the queue
  async handlePendingProposal(proposal: PendingTransactionDto): Promise<any> {
    this.logger.log({
      timestamp: new Date().toISOString(),
      message: "Triggering queue-pnding-proposal for new transaction",
      trxHash: proposal.trx_hash,
      service: "AUDIT-TRAIL-SERVICE"
    });
    // Convert Observable to Promise and await the response
    const messageResponse = await firstValueFrom(
      this.rabbitClient.send('queue-pending-proposal', proposal)
    );
    if (messageResponse.status == 'SUCCESS') {
      this.logger.log({
        timestamp: new Date().toISOString(),
        message: "Transaction hash stored in AUDIT-TRAIL-SERVICE",
        dbRecordId: messageResponse.data.db_record_id,
        trxHash: proposal.trx_hash
      });
      return messageResponse;
    } else {
      this.logger.error({
        timestamp: new Date().toISOString(),
        message: "Proposal processing failed",
        error: messageResponse.error?.message,
        trxHash: proposal.trx_hash
      });
      throw new Error(messageResponse.error?.message || 'Proposal processing failed');
    }
  }

  async updateTransactionStatus(trxHash: string, newStatus: number, proposalOnChainId: number) {
    try {
      const result = await this.proposalRepository
        .createQueryBuilder()
        .update()
        .set({ trx_status: newStatus,  proposal_onchain_id: proposalOnChainId})
        .where("trx_hash = :trxHash", { trxHash })
        .returning('*')
        .execute();

      if (result.affected === 0) {
        this.logger.warn(`Transaction with hash ${trxHash} not found`);
        throw new NotFoundException(`Transaction with hash ${trxHash} not found`);
      }

      this.logger.log({
        timestamp: new Date().toISOString(),
        message: "Transaction status updated",
        trxHash: trxHash,
        newStatus: newStatus,
        proposalOnChainId: proposalOnChainId
      });
      return result.raw[0];
    } catch (err) {
      this.logger.error({
        timestamp: new Date().toISOString(),
        message: "Failed to update transaction status",
        trxHash: trxHash,
        error: err.message,
        stack: err.stack
      });
      throw new Error(`Failed to update transaction status.`);
    }
  }

  // 📡 Listening Event from Publisher
  handleCreatedProposalPlacedEvent(proposal: ResponseTransactionStatusDto, @Ctx() context: RmqContext) {
    try {
      const pattern = context.getPattern();
      const originalMsg = context.getMessage();

      this.logger.log({
        timestamp: new Date().toISOString(),
        message: "Received proposal transaction update",
        transactionHash: proposal.transactionHash,
        pattern: pattern,
        rawMessage: JSON.parse(originalMsg.content.toString())
      });

      const proposalId = 'error' in proposal ? null : Number(proposal.data?.proposalId ?? null);
      
      this.logger.debug({
        timestamp: new Date().toISOString(),
        message: "Proposal ID status from The Graph",
        proposalId: proposalId,
        web3Status: proposal.web3Status
      });

      this.updateTransactionStatus(proposal.transactionHash, proposal.web3Status, proposalId);

    } catch (error) {
      this.logger.error({
        timestamp: new Date().toISOString(),
        message: "Invalid proposal object received",
        error: error.message,
        stack: error.stack
      });
    }
  }

}
