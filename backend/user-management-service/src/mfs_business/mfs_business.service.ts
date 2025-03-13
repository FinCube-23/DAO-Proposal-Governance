import {
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
import { MfsBusinessDTO } from './dtos/MfsBusinessDto';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ResponseTransactionStatusDto } from './dtos/response-transaction-status.dto';

@Injectable()
export class MfsBusinessService {
  constructor(
    @InjectRepository(MfsBusiness)
    private readonly mfsBusinessRepository: Repository<MfsBusiness>,
  ) {}

  async create(mfs_business: MfsBusiness): Promise<MfsBusinessDTO> {
    const { user, ...mfsInfo } =
      await this.mfsBusinessRepository.save(mfs_business);
    return mfsInfo;
  }

  async findAll(sub: string): Promise<MfsBusiness[]> {
    // const role = await this.roleChecker.findOne(sub);
    // if (role != 'MFS') {
    //   throw new UnauthorizedException();
    // }
    return this.mfsBusinessRepository.find();
  }

  async findOne(id: number, sub: string): Promise<MfsBusiness> {
    // const role = await this.roleChecker.findOne(sub);
    // if (role != 'MFS') {
    //   throw new UnauthorizedException();
    // }
    return this.mfsBusinessRepository.findOne({ where: { id } });
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

  async remove(id: number, sub: string): Promise<string> {
    // const role = await this.roleChecker.findOne(sub);
    // if (role != 'MFS') {
    //   throw new UnauthorizedException();
    // }
    await this.mfsBusinessRepository.delete(id);
    return `Removed #${id} MFS Business`;
  }

  async updateOcChainProposalId(walletAddress: string, proposalId: number) {
    const normalizedWalletAddress = walletAddress.toLowerCase();

    const business = await this.mfsBusinessRepository.findOne({
      where: { wallet_address: normalizedWalletAddress },
    });

    if (!business) {
      console.error(`No business found with wallet address: ${normalizedWalletAddress}`);
      return;
    }

    business.proposal_onchain_id = proposalId;
    business.membership_onchain_status = OnChainProposalStatus.PENDING;
    await this.mfsBusinessRepository.save(business);

    console.log(
      `Successfully updated proposal_onchain_id to ${proposalId} for wallet address: ${normalizedWalletAddress}`,
    );
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
  async handleCreatedProposalPlacedEvent(
    proposal: ResponseTransactionStatusDto,
  ) {
    try {
      console.log(
        `Received a proposal transaction update in event pattern - hash: ${proposal.transactionHash}`,
      );
      console.log(
        `THE GRAPH: Got this response before AUDIT TRAIL SERVICE: ${JSON.stringify(proposal)}`,
      );

      const proposalId =
        'error' in proposal ? null : Number(proposal.data?.proposalId ?? null);
      const proposedWallet =
        'error' in proposal ? null : proposal.data?.proposedWallet ?? null;

      console.log(
        `On-Chain Proposal ID: ${proposalId} | Member's Proposed Wallet: ${proposedWallet}`,
      );
      this.updateOcChainProposalId(proposedWallet, proposalId);
    } catch (error) {
      console.error('Invalid proposal object received:', error);
    }
  }
}
