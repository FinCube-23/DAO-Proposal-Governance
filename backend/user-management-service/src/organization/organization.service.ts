import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import {
  OrganizationRegistrationDTO,
  OrganizationResponseDTO,
  StatusResponseDto,
} from './dtos/organization.dto';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ResponseTransactionStatusDto } from './dtos/response-transaction-status.dto';
import { ListOrganizationQueryDto } from './dtos/list-organization.dto';
import {
  OrganizationListItemDto,
  OrganizationListResponseDto,
} from './dtos/organization-list-response.dto';
import { OrganizationDetailResponseDto } from './dtos/organization-detail-response.dto';
import { OnChainProposalStatus, Proposal } from './entities/proposal.entity';

@Injectable()
export class OrganizationService {
  private eventDrivenFunctionCall: Record<
    string,
    (proposal: ResponseTransactionStatusDto) => void
  >;

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private readonly proposalRepository: Repository<Proposal>,
  ) {
    // Open for Extension Close for Modification
    this.eventDrivenFunctionCall = {
      ProposalCanceled: this.handleProposalUpdatedEvent.bind(this),
      ProposalExecuted: this.handleProposalUpdatedEvent.bind(this),
      ProposalAdded: this.handleCreatedProposalPlacedEvent.bind(this),
      // Add more strings and corresponding functions as needed
    };
  }

  async create(
    dto: OrganizationRegistrationDTO,
    user: any,
  ): Promise<OrganizationResponseDTO> {
    // Step 1: Create Organization entity
    const organization = this.organizationRepository.create({
      name: dto.name,
      email: dto.email,
      type: dto.type,
      location: dto.location,
      native_currency: dto.native_currency,
      certificate: dto.certificate,
      is_active: false,
      users: [user], // Assuming ManyToMany relation
    });

    const savedOrg = await this.organizationRepository.save(organization);

    // Step 2: Create Proposal entity linked to organization
    const proposal = this.proposalRepository.create({
      trx_hash: null, // will be updated later
      onchain_id: null,
      context: dto.on_chain_registration.context,
      onchain_status: OnChainProposalStatus.PENDING,
      proposed_wallet: dto.on_chain_registration.proposed_wallet,
      organization: savedOrg,
    });

    const savedProposal = await this.proposalRepository.save(proposal);

    const response: OrganizationResponseDTO = {
      id: savedOrg.id,
      name: savedOrg.name,
      email: savedOrg.email,
      context: savedProposal.context,
      type: savedOrg.type,
      location: savedOrg.location,
      wallet_address: dto.on_chain_registration.proposed_wallet,
      native_currency: savedOrg.native_currency,
      certificate: savedOrg.certificate,
      proposal_onchain_id: savedProposal.id,
      is_active: savedOrg.is_active,
      membership_onchain_status: savedProposal.onchain_status,
    };

    return response;
  }

  async findAll(
    query: ListOrganizationQueryDto,
  ): Promise<OrganizationListResponseDto> {
    const { page = 1, limit = 10, status, type, location } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.organizationRepository
      .createQueryBuilder('org')
      .leftJoinAndSelect('org.proposals', 'proposal');

    // Apply filters if provided
    if (status) {
      queryBuilder.andWhere('proposal.onchain_status = :status', { status });
    }
    if (type) {
      queryBuilder.andWhere('org.type = :type', { type });
    }
    if (location) {
      queryBuilder.andWhere('org.location = :location', { location });
    }

    queryBuilder.skip(skip).take(limit).orderBy('org.created_at', 'DESC');

    const [orgs, total] = await queryBuilder.getManyAndCount();

    const businesses = await queryBuilder.getMany();
    const totalPages = Math.ceil(total / limit);

    const data: OrganizationListItemDto[] = orgs.map((org) => {
      // Get latest proposal or null
      const latestProposal = org.proposals.length
        ? org.proposals[org.proposals.length - 1]
        : null;

      return {
        id: org.id,
        name: org.name,
        type: org.type,
        location: org.location,
        membership_onchain_status: latestProposal
          ? latestProposal.onchain_status
          : null,
      };
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<OrganizationDetailResponseDto> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['user', 'proposals'], // Include proposals for this org
    });
  
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
  
    // Find the latest proposal
    const latestProposal = organization.proposals?.sort((a, b) => b.id - a.id)[0];

    const firstUser = organization.users?.length ? organization.users[0] : null;
  
    return {
      id: organization.id,
      name: organization.name,
      email: organization.email,
      type: organization.type,
      context: latestProposal?.context ?? null,
      location: organization.location,
      is_approved: organization.is_active, // Assuming `is_active` is approval flag
      wallet_address: latestProposal?.proposed_wallet ?? null, // From proposal
      native_currency: organization.native_currency,
      certificate: organization.certificate,
      trx_hash: latestProposal?.trx_hash ?? null,
      proposal_onchain_id: latestProposal?.onchain_id ?? null,
      membership_onchain_status: latestProposal?.onchain_status ?? null,
      created_at: organization.created_at,
      updated_at: organization.updated_at,
      admin: firstUser
        ? {
            id: firstUser.id,
            name: firstUser.name,
            email: firstUser.email,
          }
        : null,
    };
  }
  

  async getStatusByEmail(email: string): Promise<StatusResponseDto> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const organization = await this.organizationRepository.findOne({
      where: { email },
      select: ['id', 'email', 'name'],
      relations: ['proposals'],
    });

    if (!organization) {
      throw new NotFoundException(`Business with email ${email} not found`);
    }

    const latestProposal = organization.proposals?.length
      ? organization.proposals[organization.proposals.length - 1]
      : null;

    return {
      id: organization.id,
      email: organization.email,
      membership_onchain_status: latestProposal
        ? latestProposal.onchain_status
        : null,
    };
  }

  async findByEmail(email: string): Promise<Organization> {
    return this.organizationRepository.findOne({ where: { email } });
  }

  async update(
    id: number,
    updateOrganizationDto: Partial<Organization>,
  ): Promise<Organization> {
    const existingBusiness = await this.organizationRepository.findOne({
      where: { id },
    });

    if (!existingBusiness) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    // Merge the existing business with the update DTO
    const updatedBusiness = this.organizationRepository.merge(
      existingBusiness,
      updateOrganizationDto,
    );
    updatedBusiness.updated_at = new Date();

    return this.organizationRepository.save(updatedBusiness);
  }

  async updateOnChainProposalId(walletAddress: string, proposalId: number) {
    try {
      const normalizedWalletAddress = walletAddress.toLowerCase();

      const business = await this.proposalRepository.findOne({
        where: { proposed_wallet: normalizedWalletAddress },
      });

      if (!business) {
        console.error(
          `No business found with wallet address: ${normalizedWalletAddress}`,
        );
        return;
      }

      business.onchain_id = proposalId;
      business.onchain_status = OnChainProposalStatus.PENDING;
      await this.proposalRepository.save(business);

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
      const organization = await this.proposalRepository.findOne({
        where: { onchain_id: proposalId },
      });

      if (!organization) {
        console.error(
          `No organization found at on-chain proposal ID: ${proposalId}`,
        );
        return;
      }

      organization.onchain_status = status;
      await this.proposalRepository.save(organization);

      console.log(
        `Successfully updated proposal status into ${status} of proposal id ${organization.onchain_id} (on-chain)`,
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
