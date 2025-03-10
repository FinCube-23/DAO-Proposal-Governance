import { Injectable, Inject, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProposalEntity, ProposalStatus, ProposalType } from './entities/proposal.entity';
import axios from 'axios';


import { ClientProxy, RmqContext, Ctx } from '@nestjs/microservices';
import { ProposalDto, PendingTransactionDto, PaginatedProposalResponse, UpdateProposalDto } from './dto/proposal.dto';
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

  async executeProposal(executedProposalDto: UpdateProposalDto): Promise<any> {
    try {
      if (!executedProposalDto.proposalId || !executedProposalDto.transactionHash) {
        throw new Error('Proposal ID and Transaction Hash is required');
      }
      const proposal = await this.proposalRepository.findOne({
        where: {
          proposal_onchain_id: executedProposalDto.proposalId
        }
      });

      this.logger.log(`Initiating audit for Proposal Executed with ID: ${proposal.proposal_onchain_id} and Audit ID: ${proposal.audit_id}`);

      const executedTrx = {
        trx_hash: executedProposalDto.transactionHash,
        proposer_address: proposal.proposer_address,
      };
      //Handle executedProposal using audit trail service
      const audit_record = await this.handleUpdatedProposal(executedTrx);
      //Updating proposal with latest audit ID and trx_hash
      proposal.audit_id = audit_record.data.db_record_id;
      proposal.proposal_status = ProposalStatus.EXECUTED;

      const updatedProposal = await this.proposalRepository.save(proposal);

      this.logger.log(`Proposal with ID: ${proposal.proposal_onchain_id} successfully updated with latest Audit ID: ${proposal.audit_id} and status: ${proposal.proposal_status}`);

      return updatedProposal;

    } catch (err) {
      this.logger.error(`Error executing proposal: ${err.message}`);
      this.logger.debug(`Error details: ${JSON.stringify(err)}`);
      throw new Error(`Failed to execute proposal`);
    }
  }


  async cancelProposal(cancelProposalDto: UpdateProposalDto): Promise<any> {
    try {
      if (!cancelProposalDto.proposalId || !cancelProposalDto.transactionHash) {
        throw new Error('Proposal ID and Transaction Hash is required');
      }
      const proposal = await this.proposalRepository.findOne({
        where: {
          proposal_onchain_id: cancelProposalDto.proposalId
        }
      });

      this.logger.log(`Initiating audit for Proposal Cancelled with ID: ${proposal.proposal_onchain_id} and Audit ID: ${proposal.audit_id}`);

      const executedTrx = {
        trx_hash: cancelProposalDto.transactionHash,
        proposer_address: proposal.proposer_address,
      };
      //Handle executedProposal using audit trail service
      const audit_record = await this.handleUpdatedProposal(executedTrx);
      //Updating proposal with latest audit ID and trx_hash
      proposal.audit_id = audit_record.data.db_record_id;
      proposal.proposal_status = ProposalStatus.CANCEL;

      const updatedProposal = await this.proposalRepository.save(proposal);

      this.logger.log(`Proposal with ID: ${proposal.proposal_onchain_id} successfully updated with latest Audit ID: ${proposal.audit_id} and status: ${proposal.proposal_status}`);

      return updatedProposal;

    } catch (err) {
      this.logger.error(`Error cancelling proposal: ${err.message}`);
      this.logger.debug(`Error details: ${JSON.stringify(err)}`);
      throw new Error(`Failed to cancel proposal`);
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
        'proposal.proposal_status',
        'proposal.proposal_onchain_id',
        'proposal.metadata'
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

  async findByStatus(status: ProposalStatus): Promise<ProposalEntity[]> {
    return this.proposalRepository.find({ where: { proposal_status: status } });
  }

  // 💬 Producing Message in the queue
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

  // 💬 Producing Message in the queue
  async handleUpdatedProposal(proposal: PendingTransactionDto): Promise<any> {
    this.logger.log({
      message: "Triggering transaction update for a updated transaction",
      trxHash: proposal.trx_hash,
    });
    // Convert Observable to Promise and await the response
    const messageResponse = await firstValueFrom(
      this.rabbitClient.send('membership-proposal-status-update', proposal)
    );

    if (messageResponse.status == 'SUCCESS') {
      this.logger.log("Executed proposal Transaction Hash is stored at AUDIT-TRAIL-SERVICE where DB PK is : " + messageResponse.data.db_record_id);
      return messageResponse;
    } else {
      throw new Error(messageResponse.error?.message || 'Proposal processing failed');
    }

  }


  async updateProposalCreated(trxHash: string, newStatus: number, proposalOnChainId: number) {
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
  async updateProposalStatus(newStatus: number, proposalOnChainId: number) {
    try {
      const result = await this.proposalRepository
        .createQueryBuilder()
        .update()
        .set({ trx_status: newStatus }) // Updating web3_status
        .where("proposal_onchain_id = :proposalOnChainId", { proposalOnChainId }) // Using proposal_onchain_id as the condition
        .returning('*')
        .execute();

      if (result.affected === 0) {
        throw new NotFoundException(`Proposal with on-chain ID ${proposalOnChainId} not found`);
      }

      this.logger.log(`Proposal status successfully updated for on-chain ID: ${proposalOnChainId} to status: ${newStatus} | Result: ${result.raw[0]}`);
      return result.raw[0];
    } catch (err) {
      this.logger.error(`Failed to update proposal status for on-chain ID: ${proposalOnChainId}. Error: ${err}`);
      throw new Error(`Failed to update proposal status.`);
    }
  }

  // 📡 Listening Event from Publisher
  handleCreatedProposalPlacedEvent(proposal: ResponseTransactionStatusDto, @Ctx() context: RmqContext) {
    try {
      const originalMsg = context.getMessage();

      this.logger.log({
        timestamp: new Date().toISOString(),
        message: "Received proposal transaction update",
        trxHash: proposal.transactionHash,
        event_patter: context.getPattern(),
        // event_info: JSON.parse(originalMsg.content.toString())
      });

      const proposalId = 'error' in proposal ? null : Number(proposal.data?.proposalId ?? null);
      this.logger.log(`Proposal ID Status from AUDIT TRAIL's The Graph: ${proposalId}`);
      this.updateProposalCreated(proposal.transactionHash, proposal.web3Status, proposalId);
      console.log(`Pattern: ${context.getPattern()}`);
      const originalMsg = context.getMessage();
      console.log(originalMsg);
    } catch (error) {
      this.logger.error('Invalid proposal object received:', error);
    }
  }

  // 📡 Listening Event from Publisher
  async handleProposalUpdatedEvent(proposal: ResponseTransactionStatusDto, @Ctx() context: RmqContext) {
    try {
      this.logger.log(
        `Received a proposal transaction update in event pattern - hash: ${proposal.transactionHash}`,
      );
      this.logger.log(`THE GRAPH: Got this response before AUDIT TRAIL SERVICE: ${JSON.stringify(proposal)}`);

      const proposalId = 'error' in proposal ? null : Number(proposal.data?.proposalId ?? null);
      this.logger.log(`Proposal ID Status from AUDIT TRAIL's The Graph: ${proposalId}`);

      //Check if proposal ID is present
      const validEntry = await this.proposalRepository.findOne({ where: { proposal_onchain_id: proposalId } });

      if (!validEntry) {
        this.logger.error(`Proposal with ID: ${proposalId} not found in the database`);
        this.updateProposalCreated(proposal.transactionHash, proposal.web3Status, proposalId);
      }
      this.updateProposalStatus(proposal.web3Status, proposalId);
      console.log(`Pattern: ${context.getPattern()}`);
      const originalMsg = context.getMessage();
      console.log(originalMsg);
      
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
