import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DAOContract } from './entities/DAO-contract-entity';
import { RPCProvider } from './entities/RPC-Provider-entity';
import { ethers } from 'ethers';
import { validateAuth } from '@mskits/validate-auth';
import { ClientProxy } from '@nestjs/microservices';
import { WinstonLogger } from 'src/shared/common/logger/winston-logger';
@Injectable()
export class Web3ProxyService {
  private contract: ethers.Contract;
  constructor(
    private readonly daoContract: DAOContract,
    private readonly JSONRPCProvider: RPCProvider,
    private readonly logger: WinstonLogger,
    @Inject('USER_MANAGEMENT_SERVICE') private umsRabbitClient: ClientProxy,
  ) {
    const provider = new ethers.JsonRpcProvider(
      this.JSONRPCProvider.ALCHEMY_ENDPOINT,
    );
    const wallet = new ethers.Wallet(this.daoContract.signer, provider);
    this.contract = new ethers.Contract(
      this.daoContract.address,
      this.daoContract.abi,
      wallet,
    );
  }

  private provider(): ethers.JsonRpcProvider {
    const provider = new ethers.JsonRpcProvider(
      this.JSONRPCProvider.ALCHEMY_ENDPOINT,
    );
    return provider;
  }
  async getBalance(req: any, address: string): Promise<number> {
    this.logger.log(`getBalance called: address=${address}`);
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }
    const provider = this.provider();
    const balance = await provider.getBalance(address);
    this.logger.log(`getBalance success: address=${address}, balance=${Number(balance)}`);
    return Number(balance);
  }

  async getProposalThreshold(req: any): Promise<number> {
    this.logger.log(`getProposalThreshold called`);
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }
    const result = await this.contract.proposalThreshold();
    this.logger.log(`getProposalThreshold success: threshold=${result}`);
    return result;
  }

  async getOngoingProposals(req: any): Promise<any> {
    this.logger.log(`getOngoingProposals called`);
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }

    const proposals = await this.contract.getOngoingProposals();

    const formattedProposals = this.parseBigInt(proposals);
    this.logger.log(`getOngoingProposals success: count=${formattedProposals.length}`);
    return formattedProposals;
  }

  async registerMember(req, address: string, _memberURI: string): Promise<any> {
    this.logger.log(`registerMember called: address=${address}, URI=${_memberURI}`);
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }
    const result = await this.contract.registerMember(address, _memberURI);
    this.logger.log(`registerMember success: address=${address}, txHash=${result?.hash}`);
    return result;
  }

  async executeProposal(req: any, proposalId: number): Promise<any> {
    this.logger.log(`executeProposal called: proposalId=${proposalId}`);
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }

    const result = await this.contract.executeProposal(proposalId);
    this.logger.log(`executeProposal success: proposalId=${proposalId}, txHash=${result?.hash}`);
    return result;
  }

  async checkIsMemberApproved(req, memberAddress: string): Promise<any> {
    this.logger.log(`checkIsMemberApproved called: memberAddress=${memberAddress}`);
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }
    const result = await this.contract.checkIsMemberApproved(memberAddress);
    this.logger.log(`checkIsMemberApproved success: memberAddress=${memberAddress}, approved=${result}`);
    return result;
  }

  parseBigInt(array: any[]) {
    return JSON.parse(
      JSON.stringify(
        array,
        (key, value) => (typeof value === 'bigint' ? value.toString() : value), // return everything else unchanged
      ),
    );
  }

  async getProposalsByPage(
    req: any,
    cursor: number,
    howMany: number,
  ): Promise<any> {
    this.logger.log(`getProposalsByPage called: cursor=${cursor}, howMany=${howMany}`);
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }

    const proposals = await this.contract.getProposalsByPage(cursor, howMany);
    const formattedProposals = this.parseBigInt(proposals);
    this.logger.log(`getProposalsByPage success: count=${formattedProposals.length}`);

    return formattedProposals;
  }

  async getProposalById(req: any, proposalId: number): Promise<any> {
    this.logger.log(`getProposalById called: proposalId=${proposalId}`);
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }

    const proposal = await this.contract.getProposalsById(proposalId);
    const formattedProposal = this.parseBigInt(proposal);
    this.logger.log(`getProposalById success: proposalId=${proposalId}`);

    return formattedProposal;
  }
}
