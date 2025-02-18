import { Injectable, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { DAOContract } from './entities/DAO-contract-entity';
import { RPCProvider } from "./entities/RPC-Provider-entity";
import { ethers } from 'ethers';
import axios from 'axios';
@Injectable()
export class Web3ProxyService {
  private contract: ethers.Contract;
  private readonly logger = new Logger(Web3ProxyService.name);
  constructor(private readonly daoContract: DAOContract, private readonly JSONRPCProvider: RPCProvider) {
    const provider = new ethers.JsonRpcProvider(this.JSONRPCProvider.ALCHEMY_ENDPOINT);
    const wallet = new ethers.Wallet(this.daoContract.signer, provider);
    this.contract = new ethers.Contract(this.daoContract.address, this.daoContract.abi, wallet);
  }


  private provider(): ethers.JsonRpcProvider {
    const provider = new ethers.JsonRpcProvider(this.JSONRPCProvider.ALCHEMY_ENDPOINT);
    return provider;
  }
  async getBalance(address: string, sub: string): Promise<number> {
    const provider = this.provider();
    const balance = await provider.getBalance(address);
    return Number(balance);
  }

  async getProposalThreshold(sub: string): Promise<number> {
    return await this.contract.proposalThreshold();
  }

  async getOngoingProposalCount(sub: string): Promise<number> {
    return await this.contract.getOngoingProposalsCount();
  }

  async getOngoingProposals(sub: string): Promise<any> {
    return await this.contract.getOngoingProposals();
  }

  async registerMember(address: string, _memberURI: string, sub: string): Promise<any> {
    return await this.contract.registerMember(address, _memberURI);
  }

  async executeProposal(proposalId: number, sub: string): Promise<any> {
    return await this.contract.executeProposal(proposalId);
  }

  async checkIsMemberApproved(memberAddress: string, sub: string): Promise<any> {
    return await this.contract.checkIsMemberApproved(memberAddress);
  }


  parseBigInt(array: any[]) {
    return JSON.parse(JSON.stringify(array, (key, value) =>
      typeof value === 'bigint'
        ? value.toString()
        : value // return everything else unchanged
    ));
  }

  async getProposalsByPage(cursor: number, howMany: number, sub: string): Promise<any> {
    const proposals = await this.contract.getProposalsByPage(cursor, howMany);

    const formattedProposals = this.parseBigInt(proposals);

    return formattedProposals;
  }

  async getProposalById(proposalId: number): Promise<any> {
    const proposal = await this.contract.getProposalsById(proposalId);

    const formattedProposal = this.parseBigInt(proposal);

    return formattedProposal;
  }
}
