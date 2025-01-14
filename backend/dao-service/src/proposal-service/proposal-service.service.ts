import { Injectable, Inject, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProposalEntity } from './entities/proposal.entity';
import axios from 'axios';

import { ClientProxy, RmqContext, Ctx } from '@nestjs/microservices';
import { ProposalDto, CreatedProposalDto, MessageEnvelopeDto, PendingTransactionDto } from './dto/proposal.dto';
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
      const pendingTrx = { "trx_hash": proposal.trx_hash, "proposer_address": proposal.proposer_address };
      const audit_record = await this.handlePendingProposal(pendingTrx);
      proposal.audit_id = audit_record.data.db_record_id;
      const new_proposal = this.proposalRepository.create(proposal);
      this.logger.log("New proposal placed: " + new_proposal.id);
      return this.proposalRepository.save(new_proposal);
    } catch (err) {
      this.logger.error("Error triggering queue-pending-proposal: " + err);
      throw new Error("Error triggering queue-pending-proposal");
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
      const transaction = await this.proposalRepository.findOne({
        where: { trx_hash: trxHash }
      });
      this.logger.log(`Transaction status found! Getting updated at at PK: ${transaction.id} where transaction status is: ${transaction.trx_status}.`);
      if (!transaction) {
        throw new NotFoundException(`Transaction with hash ${trxHash} not found`);
      }
      transaction.trx_status = newStatus;
      this.logger.log(`Transaction status updated at PK: ${transaction.id} where transaction status is: ${transaction.trx_status}.`);
      return await this.proposalRepository.save(transaction);
    } catch (err) {
      this.logger.error(`Transaction status couldn't get updated for transaction hash: ${trxHash}. Error: ${err}`);
      throw new Error("Transaction status couldn't get updated.");
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
