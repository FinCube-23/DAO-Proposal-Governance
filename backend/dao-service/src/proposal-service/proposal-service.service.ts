import {
  Injectable,
  Inject,
  NotFoundException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProposalEntity, ProposalStatus } from './entities/proposal.entity';
import { ClientProxy } from '@nestjs/microservices';
import {
  ProposalDto,
  PendingTransactionDto,
  PaginatedProposalResponse,
  UpdateProposalDto,
} from './dto/proposal.dto';
import { catchError, firstValueFrom, timeout } from 'rxjs';
import { ResponseTransactionStatusDto } from 'src/shared/common/dto/response-transaction-status.dto';
import { WinstonLogger } from 'src/shared/common/logger/winston-logger';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ValidateAuthorizationDto } from 'src/shared/common/dto/validate-proposal.dto';
import { validateAuth } from '@fincube/validate-auth';

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
      ProposalAdded: this.handleCreatedProposalPlacedEvent.bind(this),
      // Add more strings and corresponding functions as needed
    };
  }

  // 💬 MessagePattern expects a response | This is a publisher
  async create(
    req,
    proposal: Partial<ProposalEntity>,
  ): Promise<ProposalEntity> {
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }

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
      throw new HttpException(
        {
          status: HttpStatus.SERVICE_UNAVAILABLE,
          error: 'Audit trail service is currently unavailable',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async executeProposal(
    req: any,
    executedProposalDto: UpdateProposalDto,
  ): Promise<any> {
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }

    try {
      if (
        !executedProposalDto.proposalId ||
        !executedProposalDto.transactionHash
      ) {
        throw new Error('Proposal ID and Transaction Hash is required');
      }
      const proposal = await this.proposalRepository.findOne({
        where: {
          proposal_onchain_id: executedProposalDto.proposalId,
        },
      });

      this.logger.log(
        `Initiating audit for Proposal Executed with ID: ${proposal.proposal_onchain_id} and Audit ID: ${proposal.audit_id}`,
      );

      const executedTrx = {
        trx_hash: executedProposalDto.transactionHash,
        proposer_address: proposal.proposer_address,
      };
      //Handle executedProposal using audit trail service
      const audit_record = await this.handleUpdatedProposal(executedTrx);
      //Updating proposal with latest audit ID and trx_hash
      proposal.audit_id = audit_record.data.db_record_id;
      proposal.trx_status = 0;
      proposal.proposal_status = ProposalStatus.EXECUTED;

      const updatedProposal = await this.proposalRepository.save(proposal);

      this.logger.log(
        `Proposal with ID: ${proposal.proposal_onchain_id} successfully updated with latest Audit ID: ${proposal.audit_id} and status: ${proposal.proposal_status} | Waiting for confirmation from Audit Trail`,
      );

      return updatedProposal;
    } catch (err) {
      this.logger.error(`Error executing proposal: ${err.message}`);
      this.logger.debug(`Error details: ${JSON.stringify(err)}`);
      throw new Error(`Failed to execute proposal`);
    }
  }

  async cancelProposal(
    req: any,
    cancelProposalDto: UpdateProposalDto,
  ): Promise<any> {
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }

    try {
      if (!cancelProposalDto.proposalId || !cancelProposalDto.transactionHash) {
        throw new Error('Proposal ID and Transaction Hash is required');
      }
      const proposal = await this.proposalRepository.findOne({
        where: {
          proposal_onchain_id: cancelProposalDto.proposalId,
        },
      });

      this.logger.log(
        `Initiating audit for Proposal Cancelled with ID: ${proposal.proposal_onchain_id} and Audit ID: ${proposal.audit_id}`,
      );

      const executedTrx = {
        trx_hash: cancelProposalDto.transactionHash,
        proposer_address: proposal.proposer_address,
      };
      //Handle executedProposal using audit trail service
      const audit_record = await this.handleUpdatedProposal(executedTrx);
      //Updating proposal with latest audit ID and trx_hash
      proposal.audit_id = audit_record.data.db_record_id;
      proposal.trx_status = 0;
      proposal.proposal_status = ProposalStatus.CANCEL;

      const updatedProposal = await this.proposalRepository.save(proposal);

      this.logger.log(
        `Proposal with ID: ${proposal.proposal_onchain_id} successfully updated with latest Audit ID: ${proposal.audit_id} and status: ${proposal.proposal_status} | Waiting for confirmation from Audit Trail`,
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
  ): Promise<PaginatedProposalResponse> {
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }

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
        'proposal.metadata',
      ])
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

  // 💬 Producing Message in the queue
  async handlePendingProposal(proposal: PendingTransactionDto): Promise<any> {
    this.logger.log({
      message: 'Triggering queue-pending-proposal for a new transaction',
      trxHash: proposal.trx_hash,
    });
    // Convert Observable to Promise and await the response
    const messageResponse = await firstValueFrom(
      this.rabbitClient.send('queue-pending-proposal', proposal).pipe(
        timeout(50000), // Nginx default timeout is 60 seconds. So we are setting Message Broker Response as 50 seconds.
        catchError((err) => {
          throw new Error('AUDIT-TRAIL-SERVICE timeout or unreachable');
        }),
        /* Note:
                As this project architecture is designed with low number of services 
                we are covering this type of cross service synchronization with Producer-Consumer
                model where a response is expected. But for larger infrastructure we will mostly rely on
                Pub/Sub model where Fire and Forget will be implemented.
                Overall, in this architecture though we have used Prod-Cons Model but Timeout is integrated.   
        */ 
      ),
    );
    if (messageResponse.status == 'SUCCESS') {
      this.logger.log(
        'New proposal Transaction Hash is stored at AUDIT-TRAIL-SERVICE where DB PK is : ' +
          messageResponse.data.db_record_id,
      );
      return messageResponse;
    } else {
      this.logger.error(
        `Audit service returned failure: ${JSON.stringify(messageResponse.error)}`,
      );
      throw new Error(
        messageResponse.error?.message || 'Proposal processing failed',
      );
    }
  }

  // 💬 Producing Message in the queue
  async handleUpdatedProposal(proposal: PendingTransactionDto): Promise<any> {
    this.logger.log({
      message:
        'Triggering transaction reference for an updated proposal (Execute/Cancel)',
      trxHash: proposal.trx_hash,
    });
    // Convert Observable to Promise and await the response
    const messageResponse = await firstValueFrom(
      this.rabbitClient.send('membership-proposal-status-update', proposal),
    );

    if (messageResponse.status == 'SUCCESS') {
      this.logger.log(
        'Executed proposal Transaction Hash is stored at AUDIT-TRAIL-SERVICE where DB PK is : ' +
          messageResponse.data.db_record_id,
      );
      return messageResponse;
    } else {
      throw new Error(
        messageResponse.error?.message || 'Proposal processing failed',
      );
    }
  }

  async updateProposalCreated(
    trxHash: string,
    newStatus: number,
    proposalOnChainId: number,
  ) {
    try {
      const result = await this.proposalRepository
        .createQueryBuilder()
        .update()
        .set({ trx_status: newStatus, proposal_onchain_id: proposalOnChainId })
        .where('trx_hash = :trxHash', { trxHash })
        .returning('*')
        .execute();

      if (result.affected === 0) {
        throw new NotFoundException(
          `Transaction with hash ${trxHash} not found`,
        );
      }

      this.logger.log(
        `Transaction status successfully updated for hash: ${trxHash} to status: ${newStatus} | Result: ${result.raw[0]}`,
      );
      return result.raw[0];
    } catch (err) {
      this.logger.error(
        `Failed to update transaction status for hash: ${trxHash}. Error: ${err}`,
      );
      throw new Error(`Failed to update transaction status.`);
    }
  }

  async updateProposalStatus(newStatus: number, proposalOnChainId: number) {
    try {
      const result = await this.proposalRepository
        .createQueryBuilder()
        .update()
        .set({ trx_status: newStatus }) // Updating web3_status
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
    exchange: 'proposal-update-exchange',
    routingKey: '',
    queue: 'dao-service-queue',
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

  async handleCreatedProposalPlacedEvent(
    proposal: ResponseTransactionStatusDto,
  ) {
    try {
      this.logger.log(
        `Received a proposal transaction update in event pattern - hash: ${proposal.transactionHash}`,
      );

      const proposalId =
        'error' in proposal ? null : Number(proposal.data?.proposalId ?? null);
      this.logger.log(
        `Proposal ID Status from AUDIT TRAIL's The Graph: ${proposalId}`,
      );
      if (proposalId) {
        await this.updateProposalCreated(
          proposal.transactionHash,
          proposal.web3Status,
          proposalId,
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
        `Received a proposal transaction update in event pattern - hash: ${proposal.transactionHash}`,
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

  async test(req: any, packet: ValidateAuthorizationDto): Promise<any> {
    const res = await validateAuth(
      req,
      this.umsRabbitClient as any,
      packet.options,
    );

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }

    return res;
  }
}
