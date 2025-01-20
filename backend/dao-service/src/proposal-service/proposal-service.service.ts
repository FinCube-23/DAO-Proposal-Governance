import { Injectable, Inject, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProposalEntity } from './entities/proposal.entity';
import axios from 'axios';

import { ClientProxy, RmqContext, Ctx } from '@nestjs/microservices';
import { ProposalDto, PendingTransactionDto } from './dto/proposal.dto';
import { firstValueFrom, timeout } from 'rxjs';
import { ResponseTransactionStatusDto } from 'src/shared/common/dto/response-transaction-status.dto';


@Injectable()
export class ProposalServiceService {
  public update_proposals: ProposalDto[];
  private readonly logger = new Logger(ProposalServiceService.name);
  constructor(
    @InjectRepository(ProposalEntity) private proposalRepository: Repository<ProposalEntity>,
    @Inject('PROPOSAL_SERVICE') private rabbitClient: ClientProxy
  ) {
    this.update_proposals = [];
  }

  private async getUserRole(sub: string): Promise<string> {
    try {
      const response = await axios.get(`http://user_management_api:3000/authentication/${sub}`);
      return response.data;
    } catch (error) {
      this.logger.log("Role of user not found");
      throw new UnauthorizedException("Role of user not found");;
    }
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
      this.logger.log(`New proposal created with ID: ${saved_proposal.id}`);
      
      return saved_proposal;

    } catch (err) {
      this.logger.error(`Failed to create proposal: ${err.message}`);
      this.logger.debug(`Error details: ${JSON.stringify(err)}`);
      throw new Error(`Failed to create proposal`);
    }
  }

  async findAllProposals(sub: string): Promise<any> {
    const role = await this.getUserRole(sub);
    if (role != 'MFS') {
      this.logger.error("User does not have permission for role: " + role);
      throw new UnauthorizedException("User does not have permission");
    }
    return this.proposalRepository.find();
  }

  // 💬 Publishing Message in the queue
  async handlePendingProposal(proposal: PendingTransactionDto): Promise<any> {
    this.logger.log("Triggering queue-pending-proposal for Transaction: " + proposal.trx_hash);
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

  async updateTransactionStatus(trxHash: string, newStatus: number) {
    try {
      const result = await this.proposalRepository
        .createQueryBuilder()
        .update()
        .set({ trx_status: newStatus })
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
      this.updateTransactionStatus(proposal.transactionHash, proposal.web3Status);
      console.log(`Pattern: ${context.getPattern()}`);
      const originalMsg = context.getMessage();
      console.log(originalMsg);
    } catch (error) {
      this.logger.error('Invalid proposal object received:', error);
    }
  }

  async findAll(sub: string): Promise<any> {
    const role = await this.getUserRole(sub);
    if (role != 'MFS') {
      this.logger.error("User does not have permission for role: " + role);
      throw new UnauthorizedException("User does not have permission");
    }
    return this.proposalRepository.find();
  }

}
