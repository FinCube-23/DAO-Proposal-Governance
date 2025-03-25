import {
  Inject,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { DAOContract } from './entities/DAO-contract-entity';
import { RPCProvider } from './entities/RPC-Provider-entity';
import { ethers } from 'ethers';
import { validateAuth } from '@fincube/validate-auth';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class Web3ProxyService {
  private contract: ethers.Contract;
  private readonly logger = new Logger(Web3ProxyService.name);
  constructor(
    private readonly daoContract: DAOContract,
    private readonly JSONRPCProvider: RPCProvider,
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
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }
    const provider = this.provider();
    const balance = await provider.getBalance(address);
    return Number(balance);
  }

  async getProposalThreshold(req: any): Promise<number> {
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }
    return await this.contract.proposalThreshold();
  }

  async getOngoingProposals(req: any): Promise<any> {
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }

    const proposals = await this.contract.getOngoingProposals();

    const formattedProposals = this.parseBigInt(proposals);

    return formattedProposals;
  }

  async registerMember(req, address: string, _memberURI: string): Promise<any> {
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }
    return await this.contract.registerMember(address, _memberURI);
  }

  async executeProposal(req: any, proposalId: number): Promise<any> {
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }
    return await this.contract.executeProposal(proposalId);
  }

  async checkIsMemberApproved(req, memberAddress: string): Promise<any> {
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }
    return await this.contract.checkIsMemberApproved(memberAddress);
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
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }

    const proposals = await this.contract.getProposalsByPage(cursor, howMany);

    const formattedProposals = this.parseBigInt(proposals);

    return formattedProposals;
  }

  async getProposalById(req: any, proposalId: number): Promise<any> {
    const res = await validateAuth(req, this.umsRabbitClient as any);

    if (res.status != 'SUCCESS') {
      throw new UnauthorizedException(
        'You are not authorized to perform this task',
      );
    }

    const proposal = await this.contract.getProposalsById(proposalId);

    const formattedProposal = this.parseBigInt(proposal);

    return formattedProposal;
  }
}
