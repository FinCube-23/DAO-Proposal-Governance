import {
  Injectable,
  Inject,
  NotFoundException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProposalEntity, ProposalStatus } from './entities/proposal.entity';
import { ClientProxy } from '@nestjs/microservices';
import { PaginatedProposalResponse, ProposalDto } from './dto/proposal.dto';
import { ResponseTransactionStatusDto } from 'src/shared/common/dto/response-transaction-status.dto';
import { WinstonLogger } from 'src/shared/common/logger/winston-logger';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { validateAuth } from '@mskits/validate-auth';

@Injectable()
export class ProposalServiceService {
  public update_proposals: ProposalDto[];
  private eventDrivenFunctionCall: Record<
    string,
    (proposal: ResponseTransactionStatusDto) => void
  >;
  constructor(
    @InjectRepository(ProposalEntity)
    private proposalRepository: Repository<ProposalEntity>,
    @Inject('PROPOSAL_SERVICE') private rabbitClient: ClientProxy,
    @Inject('USER_MANAGEMENT_SERVICE') private umsRabbitClient: ClientProxy,
    private readonly logger: WinstonLogger,
  ) {
    this.logger.setContext(ProposalServiceService.name);
    this.update_proposals = [];
    // Open for Extension Close for Modification
    this.eventDrivenFunctionCall = {
      ProposalCanceled: this.handleProposalUpdatedEvent.bind(this),
      ProposalExecuted: this.handleProposalUpdatedEvent.bind(this),
      ProposalAdded: this.handleProposalPlacedEvent.bind(this),
      // Add more strings and corresponding functions as needed
    };
  }

  async create(req, proposal: ProposalDto): Promise<ProposalEntity> {
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }

    try {
      // First verify we have the required fields
      if (
        !proposal.onChainData.transactionHash ||
        !proposal.onChainData.signedBy
      ) {
        throw new Error('Transaction hash and proposer address are required');
      }

      const existingProposal = await this.proposalRepository.findOne({
        where: { transaction_hash: proposal.onChainData.transactionHash },
      });

      if (existingProposal) {
        this.logger.warn(
          `Proposal with transaction hash ${proposal.onChainData.transactionHash} already exists.`,
        );
        throw new BadRequestException(
          `Proposal with this transaction hash already exists.`,
        );
      }

      const context = proposal.onChainData.context;
      this.logger.log(
        `Creating proposal with context: ${JSON.stringify(context)}`,
      );
      const new_proposal = this.proposalRepository.create({
        proposer_address: proposal.onChainData.signedBy,
        proposal_type: proposal.proposal_type,
        description: proposal.onChainData.context.description || null,
        transaction_hash: proposal.onChainData.transactionHash,
      });

      const saved_proposal = await this.proposalRepository.save(new_proposal);
      this.logger.log({
        message: `New proposal created with ID: ${saved_proposal.id}`,
        wallet: proposal.onChainData.signedBy,
      });

      return saved_proposal;
    } catch (err) {
      this.logger.error(`Failed to create proposal: ${err.message}`);
      this.logger.debug(`Error details: ${JSON.stringify(err)}`);
      if (
        err instanceof BadRequestException ||
        err instanceof UnauthorizedException
      ) {
        throw err;
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `Failed to create proposal ${err.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async executeProposal(req: any, proposalId: number): Promise<any> {
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }

    try {
      if (!proposalId) {
        throw new Error('Proposal ID is required');
      }
      const proposal = await this.proposalRepository.findOne({
        where: {
          proposal_onchain_id: proposalId,
        },
      });

      this.logger.log(
        // `Initiating audit for Proposal Executed with ID: ${proposal.proposal_onchain_id} and Audit ID: ${proposal.audit_id}`,
        `Initiating audit for Proposal Executed with ID: ${proposal.proposal_onchain_id}`,
      );

      proposal.transaction_status = 0;
      proposal.proposal_status = ProposalStatus.EXECUTED;

      const updatedProposal = await this.proposalRepository.save(proposal);

      this.logger.log(
        // `Proposal with ID: ${proposal.proposal_onchain_id} successfully updated with latest Audit ID: ${proposal.audit_id} and status: ${proposal.proposal_status} | Waiting for confirmation from Audit Trail`,
        `Proposal with ID: ${proposal.proposal_onchain_id} successfully updated with status: ${proposal.proposal_status} | Waiting for confirmation from Audit Trail`,
      );

      return updatedProposal;
    } catch (err) {
      this.logger.error(`Error executing proposal: ${err.message}`);
      this.logger.debug(`Error details: ${JSON.stringify(err)}`);
      throw new Error(`Failed to execute proposal`);
    }
  }

  async cancelProposal(req: any, proposalId: number): Promise<any> {
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }

    try {
      if (!proposalId) {
        throw new Error('Proposal ID is required');
      }
      const proposal = await this.proposalRepository.findOne({
        where: {
          proposal_onchain_id: proposalId,
        },
      });

      this.logger.log(
        // `Initiating audit for Proposal Cancelled with ID: ${proposal.proposal_onchain_id} and Audit ID: ${proposal.audit_id}`,
        `Initiating audit for Proposal Cancelled with ID: ${proposal.proposal_onchain_id}`,
      );

      proposal.transaction_status = 0;
      proposal.proposal_status = ProposalStatus.CANCEL;

      const updatedProposal = await this.proposalRepository.save(proposal);

      this.logger.log(
        // `Proposal with ID: ${proposal.proposal_onchain_id} successfully updated with latest Audit ID: ${proposal.audit_id} and status: ${proposal.proposal_status} | Waiting for confirmation from Audit Trail`,
        `Proposal with ID: ${proposal.proposal_onchain_id} successfully updated with status: ${proposal.proposal_status} | Waiting for confirmation from Audit Trail`,
      );

      return updatedProposal;
    } catch (err) {
      this.logger.error(`Error cancelling proposal: ${err.message}`);
      this.logger.debug(`Error details: ${JSON.stringify(err)}`);
      throw new Error(`Failed to cancel proposal`);
    }
  }

  async findById(req: any, id: number): Promise<ProposalEntity> {
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }
    const proposal = await this.proposalRepository.findOne({
      where: { id },
    });

    if (!proposal) {
      throw new NotFoundException(`Proposal with ID ${id} not found`);
    }

    return proposal;
  }

  async findAll(
    req,
    page: number = 1,
    limit: number = 10,
    filter?: string,
  ): Promise<PaginatedProposalResponse> {
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }

    // Calculate records to skip: e.g., page 3 with limit 10 = skip 20 records (returns records 21-30)
    const skip = (page - 1) * limit;

    const query = await this.proposalRepository
      .createQueryBuilder('proposal')
      .select([
        'proposal.id',
        'proposal.proposal_type',
        'proposal.proposer_address',
        'proposal.proposal_status',
        'proposal.proposal_onchain_id',
        'proposal.description',
        'proposal.event_logs',
      ]);

    if (filter && filter !== 'all') {
      query.where('proposal.proposal_status = :filter', {
        filter: filter.toLowerCase(),
      });
    }

    const [proposals, total] = await query
      .orderBy('proposal.id', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: proposals,
      total,
      page,
      limit,
    };
  }

  async findByStatus(
    req: any,
    status: ProposalStatus,
  ): Promise<ProposalEntity[]> {
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }

    return this.proposalRepository.find({ where: { proposal_status: status } });
  }

  async updateProposalCreated(
    transactionHash: string,
    newStatus: number,
    proposalOnChainId: number,
    metadata: string,
  ) {
    try {
      const result = await this.proposalRepository
        .createQueryBuilder()
        .update()
        .set({
          transaction_status: newStatus,
          proposal_onchain_id: proposalOnChainId,
          event_logs: metadata,
        })
        .where('transaction_hash = :transactionHash', { transactionHash })
        .returning('*')
        .execute();

      if (result.affected === 0) {
        throw new NotFoundException(
          `Transaction with hash ${transactionHash} not found`,
        );
      }

      this.logger.log(
        `Transaction status successfully updated for hash: ${transactionHash} to status: ${newStatus} | Result: ${result.raw[0]}`,
      );
      return result.raw[0];
    } catch (err) {
      this.logger.error(
        `Failed to update transaction status for hash: ${transactionHash}. Error: ${err}`,
      );
      throw new Error(`Failed to update transaction status.`);
    }
  }

  async updateProposalStatus(newStatus: number, proposalOnChainId: number) {
    try {
      const result = await this.proposalRepository
        .createQueryBuilder()
        .update()
        .set({ transaction_status: newStatus }) // Updating web3_status
        .where('proposal_onchain_id = :proposalOnChainId', {
          proposalOnChainId,
        }) // Using proposal_onchain_id as the condition
        .returning('*')
        .execute();

      if (result.affected === 0) {
        throw new NotFoundException(
          `Proposal with on-chain ID ${proposalOnChainId} not found`,
        );
      }

      this.logger.log(
        `Proposal status successfully updated for on-chain ID: ${proposalOnChainId} to status: ${newStatus} | Result: ${result.raw[0]}`,
      );
      return result.raw[0];
    } catch (err) {
      this.logger.error(
        `Failed to update proposal status for on-chain ID: ${proposalOnChainId}. Error: ${err}`,
      );
      throw new Error(`Failed to update proposal status.`);
    }
  }

  // 📡 Listening Event from Publisher
  @RabbitSubscribe({
    exchange: 'exchange.web3_event_hub.fanout',
    routingKey: '',
    queue: 'dao_service.web3_events.queue',
    queueOptions: {
      durable: true,
    },
  })
  async handleProposalEventAction(proposal: ResponseTransactionStatusDto) {
    this.logger.log(
      `THE GRAPH: Got this response before AUDIT TRAIL SERVICE: ${JSON.stringify(proposal)}`,
    );
    const typename = proposal?.data?.__typename ?? null;
    this.logger.log(`Redirected on-chain event by AUDIT-TRAIL: ${typename}`);
    if (this.eventDrivenFunctionCall[typename]) {
      // Call the corresponding function from the dictionary
      this.logger.log(
        `Calling function for on-chain event: ${this.eventDrivenFunctionCall[typename]?.name ?? 'Unknown function'}`,
      );
      await this.eventDrivenFunctionCall[typename](proposal);
    } else {
      this.logger.warn(`On-chain event type "${typename}" is not recognized.`);
    }
  }

  async handleProposalPlacedEvent(proposal: ResponseTransactionStatusDto) {
    try {
      this.logger.log(
        `Received a proposal transaction update in event pattern - hash: ${proposal?.onChainData?.transactionHash}`,
      );

      this.logger.log(
        `Full proposal object received: ${JSON.stringify(proposal)}`,
      );

      const proposalId =
        'error' in proposal ? null : Number(proposal.data?.proposalId ?? null);
      this.logger.log(
        `Proposal ID Status from AUDIT TRAIL's The Graph: ${proposalId}`,
      );
      if (proposalId) {
        await this.updateProposalCreated(
          proposal.onChainData.transactionHash,
          proposal.web3Status,
          proposalId,
          JSON.stringify(proposal.onChainData.context.event_logs) || null,
        );
      } else {
        this.logger.warn(
          'Something went wrong! Proposal ID is null | Off-chain DB status is not updated.',
        );
      }
    } catch (error) {
      this.logger.error('Invalid proposal object received:', error);
    }
  }

  // 📡 Listening Event from Publisher
  async handleProposalUpdatedEvent(proposal: ResponseTransactionStatusDto) {
    try {
      this.logger.log(
        `Received a proposal transaction update in event pattern - hash: ${proposal?.onChainData?.transactionHash}`,
      );

      const proposalId =
        'error' in proposal ? null : Number(proposal.data?.proposalId ?? null);
      this.logger.log(
        `Proposal ID Status from AUDIT TRAIL's The Graph: ${proposalId}`,
      );

      //Check if proposal ID is present
      const validEntry = await this.proposalRepository.findOne({
        where: { proposal_onchain_id: proposalId },
      });

      if (!validEntry) {
        this.logger.error(
          `Proposal with ID: ${proposalId} not found in the database`,
        );
        return;
      }
      await this.updateProposalStatus(proposal.web3Status, proposalId);
    } catch (error) {
      this.logger.error('Invalid proposal object received:', error);
    }
  }
}
