import { Injectable, Inject, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProposalEntity } from './entities/proposal.entity';
import { ClientProxy, RmqContext, Ctx } from '@nestjs/microservices';
import { ProposalDto, PendingTransactionDto, PaginatedProposalResponse } from './dto/proposal.dto';
import { firstValueFrom } from 'rxjs';
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
        proposer_address: proposal.proposer_address,
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
        message: `New proposal created with ID: ${saved_proposal.id}`,
        wallet: proposal.proposer_address,
      });

      return saved_proposal;

    } catch (err) {
      this.logger.error(`Failed to create proposal: ${err.message}`);
      this.logger.debug(`Error details: ${JSON.stringify(err)}`);
      throw new Error(`Failed to create proposal`);
    }
  }

  async findById(id: number): Promise<ProposalEntity> {
    const proposal = await this.proposalRepository.findOne({
      where: { id }
    });

    if (!proposal) {
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
      message: "Triggering queue-pending-proposal for a new transaction",
      trxHash: proposal.trx_hash,
    });
    // Convert Observable to Promise and await the response
    const messageResponse = await firstValueFrom(
      this.rabbitClient.send('queue-pending-proposal', proposal)
    );
    if (messageResponse.status == 'SUCCESS') {
      this.logger.log("New proposal Transaction Hash is stored at AUDIT-TRAIL-SERVICE where DB PK is : " + messageResponse.data.db_record_id);
      return messageResponse;
    } else {
      throw new Error(messageResponse.error?.message || 'Proposal processing failed');
    }
  }

  async updateTransactionStatus(trxHash: string, newStatus: number, proposalOnChainId: number) {
    try {
      const result = await this.proposalRepository
        .createQueryBuilder()
        .update()
        .set({ trx_status: newStatus, proposal_onchain_id: proposalOnChainId })
        .where("trx_hash = :trxHash", { trxHash })
        .returning('*')
        .execute();

      if (result.affected === 0) {
        throw new NotFoundException(`Transaction with hash ${trxHash} not found`);
      }

      this.logger.log(`Transaction status successfully updated for hash: ${trxHash} to status: ${newStatus} | Result: ${result.raw[0]}`);
      return result.raw[0];
    } catch (err) {
      this.logger.error(`Failed to update transaction status for hash: ${trxHash}. Error: ${err}`);
      throw new Error(`Failed to update transaction status.`);
    }
  }

  // 📡 Listening Event from Publisher
  handleCreatedProposalPlacedEvent(proposal: ResponseTransactionStatusDto, @Ctx() context: RmqContext) {
    try {
      this.logger.log(
        `Received a proposal transaction update in event pattern - hash: ${proposal.transactionHash}`,
      );
      this.logger.log(`THE GRAPH: Got this response before AUDIT TRAIL SERVICE: ${JSON.stringify(proposal)}`);

      const proposalId = 'error' in proposal ? null : Number(proposal.data?.proposalId ?? null);
      this.logger.log(`Proposal ID Status from AUDIT TRAIL's The Graph: ${proposalId}`);
      this.updateTransactionStatus(proposal.transactionHash, proposal.web3Status, proposalId);
      console.log(`Pattern: ${context.getPattern()}`);
      const originalMsg = context.getMessage();
      console.log(originalMsg);
    } catch (error) {
      this.logger.error('Invalid proposal object received:', error);
    }
  }

}
