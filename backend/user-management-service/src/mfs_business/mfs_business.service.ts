import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MfsBusiness,
  OnChainProposalStatus,
} from './entities/mfs_business.entity';
import { MfsBusinessDTO, StatusResponseDto } from './dtos/MfsBusinessDto';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ResponseTransactionStatusDto } from './dtos/response-transaction-status.dto';
import { ListOrganizationQueryDto } from './dtos/list-organization.dto';
import { OrganizationListResponseDto } from './dtos/organization-list-response.dto';
import { OrganizationDetailResponseDto } from './dtos/organization-detail-response.dto';

@Injectable()
export class MfsBusinessService {
  private eventDrivenFunctionCall: Record<
    string,
    (proposal: ResponseTransactionStatusDto) => void
  >;

  constructor(
    @InjectRepository(MfsBusiness)
    private readonly mfsBusinessRepository: Repository<MfsBusiness>,
  ) {
    // Open for Extension Close for Modification
    this.eventDrivenFunctionCall = {
      ProposalCanceled: this.handleProposalUpdatedEvent.bind(this),
      ProposalExecuted: this.handleProposalUpdatedEvent.bind(this),
      ProposalAdded: this.handleCreatedProposalPlacedEvent.bind(this),
      // Add more strings and corresponding functions as needed
    };
  }

  async create(mfs_business: MfsBusiness): Promise<MfsBusinessDTO> {
    const { user, ...mfsInfo } =
      await this.mfsBusinessRepository.save(mfs_business);
    return mfsInfo;
  }

  async findAll(
    query: ListOrganizationQueryDto,
  ): Promise<OrganizationListResponseDto> {
    const { page = 1, limit = 10, status, type, location } = query;
    const skip = (page - 1) * limit;

    const queryBuilder =
      this.mfsBusinessRepository.createQueryBuilder('business');

    // Apply filters if provided
    if (status) {
      queryBuilder.andWhere('business.membership_onchain_status = :status', {
        status,
      });
    }
    if (type) {
      queryBuilder.andWhere('business.type = :type', { type });
    }
    if (location) {
      queryBuilder.andWhere('business.location = :location', { location });
    }

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder
      .select([
        'business.id',
        'business.name',
        'business.type',
        'business.location',
        'business.membership_onchain_status',
      ])
      .skip(skip)
      .take(limit)
      .orderBy('business.created_at', 'DESC');

    const businesses = await queryBuilder.getMany();
    const totalPages = Math.ceil(total / limit);

    return {
      data: businesses,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<OrganizationDetailResponseDto> {
    const organization = await this.mfsBusinessRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!organization) {
      throw new NotFoundException(`organization with ID ${id} not found`);
    }

    return {
      id: organization.id,
      name: organization.name,
      email: organization.email,
      context: organization.context,
      type: organization.type,
      location: organization.location,
      is_approved: organization.is_approved,
      wallet_address: organization.wallet_address,
      native_currency: organization.native_currency,
      certificate: organization.certificate,
      trx_hash: organization.trx_hash,
      proposal_onchain_id: organization.proposal_onchain_id,
      membership_onchain_status: organization.membership_onchain_status,
      created_at: organization.created_at,
      updated_at: organization.updated_at,
      user: organization.user
        ? {
            id: organization.user.id,
            name: organization.user.name,
            email: organization.user.email,
          }
        : null,
    };
  }

  async getStatusByEmail(email: string): Promise<StatusResponseDto> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const business = await this.mfsBusinessRepository.findOne({
      where: { email },
      select: ['id', 'email', 'membership_onchain_status'],
    });

    if (!business) {
      throw new NotFoundException(`Business with email ${email} not found`);
    }

    return {
      id: business.id,
      email: business.email,
      membership_onchain_status: business.membership_onchain_status,
    };
  }

  async findByEmail(email: string): Promise<MfsBusiness> {
    // const role = await this.roleChecker.findOne(sub);
    // if (role != 'MFS') {
    //   throw new UnauthorizedException();
    // }
    return this.mfsBusinessRepository.findOne({ where: { email } });
  }

  async update(
    id: number,
    updateMfsBusinessDto: Partial<MfsBusiness>,
  ): Promise<MfsBusiness> {
    const existingBusiness = await this.mfsBusinessRepository.findOne({
      where: { id },
    });

    if (!existingBusiness) {
      throw new NotFoundException(`MFS Business with ID ${id} not found`);
    }

    // Merge the existing business with the update DTO
    const updatedBusiness = this.mfsBusinessRepository.merge(
      existingBusiness,
      updateMfsBusinessDto,
    );
    updatedBusiness.updated_at = new Date();

    return this.mfsBusinessRepository.save(updatedBusiness);
  }

  async updateOnChainProposalId(walletAddress: string, proposalId: number) {
    try {
      const normalizedWalletAddress = walletAddress.toLowerCase();

      const business = await this.mfsBusinessRepository.findOne({
        where: { wallet_address: normalizedWalletAddress },
      });

      if (!business) {
        console.error(
          `No business found with wallet address: ${normalizedWalletAddress}`,
        );
        return;
      }

      business.proposal_onchain_id = proposalId;
      business.membership_onchain_status = OnChainProposalStatus.PENDING;
      await this.mfsBusinessRepository.save(business);

      console.log(
        `Successfully updated proposal_onchain_id to ${proposalId} for wallet address: ${normalizedWalletAddress}`,
      );
    } catch (error) {
      console.error(
        'Proposal on-chain ID or Wallet address issue found | Error:',
        error,
      );
    }
  }

  async updateOnChainProposalStatus(
    proposalId: number,
    status: OnChainProposalStatus,
  ) {
    try {
      const business = await this.mfsBusinessRepository.findOne({
        where: { proposal_onchain_id: proposalId },
      });

      if (!business) {
        console.error(
          `No organization found at on-chain proposal ID: ${proposalId}`,
        );
        return;
      }

      business.membership_onchain_status = status;
      await this.mfsBusinessRepository.save(business);

      console.log(
        `Successfully updated proposal status into ${status} of proposal id ${business.proposal_onchain_id} (on-chain)`,
      );
    } catch (error) {
      console.error('Proposal on-chain ID issue found | Error:', error);
    }
  }

  // 📡 Listening Event from Publisher
  @RabbitSubscribe({
    exchange: 'proposal-update-exchange',
    routingKey: '',
    queue: 'user-management-service-queue',
    queueOptions: {
      durable: true,
    },
  })
  async handleMembershipEventAction(proposal: ResponseTransactionStatusDto) {
    console.log(
      `THE GRAPH: Got this response before AUDIT TRAIL SERVICE: ${JSON.stringify(proposal)}`,
    );
    const typename = proposal?.data?.__typename ?? null;
    console.log(`Redirected on-chain event by AUDIT-TRAIL: ${typename}`);

    if (this.eventDrivenFunctionCall[typename]) {
      // Call the corresponding function from the dictionary
      console.log(
        `Calling function for on-chain event: ${this.eventDrivenFunctionCall[typename]?.name ?? 'Unknown function'}`,
      );
      await this.eventDrivenFunctionCall[typename](proposal);
    } else {
      console.warn(`On-chain event type "${typename}" is not recognized.`);
    }
  }

  async handleCreatedProposalPlacedEvent(
    proposal: ResponseTransactionStatusDto,
  ) {
    try {
      console.log(
        `Received a proposal transaction update in event pattern - hash: ${proposal.transactionHash}`,
      );

      const proposalId =
        'error' in proposal ? null : Number(proposal.data?.proposalId ?? null);
      const proposedWallet =
        'error' in proposal ? null : proposal.data?.proposedWallet ?? null;

      console.log(
        `On-Chain Proposal ID: ${proposalId} | Member's Proposed Wallet: ${proposedWallet}`,
      );
      await this.updateOnChainProposalId(proposedWallet, proposalId);
    } catch (error) {
      console.error('Invalid proposal object received:', error);
    }
  }

  async handleProposalUpdatedEvent(proposal: ResponseTransactionStatusDto) {
    const typename = proposal?.data?.__typename ?? null;
    const proposalId =
      'error' in proposal ? null : Number(proposal.data?.proposalId ?? null);
    console.log(`Processed on-chain proposal ID: ${proposalId}`);
    if (typename == 'ProposalExecuted') {
      console.log(
        'Redirecting the AUDIT-TRAIL-SERVICE event call to Execute Proposal',
      );
      await this.updateOnChainProposalStatus(
        proposalId,
        OnChainProposalStatus.APPROVED,
      );
    } else {
      console.log(
        'Redirecting the AUDIT-TRAIL-SERVICE event call to Cancel Proposal',
      );
      await this.updateOnChainProposalStatus(
        proposalId,
        OnChainProposalStatus.CANCELLED,
      );
    }
  }
}
