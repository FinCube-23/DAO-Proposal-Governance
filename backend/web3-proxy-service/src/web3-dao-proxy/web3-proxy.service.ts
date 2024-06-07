import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DAOContract } from './entities/DAO-contract-entity';
import { RPCProvider } from "./entities/RPC-Provider-entity";
import { ethers } from 'ethers';
import axios from 'axios';
@Injectable()
export class Web3ProxyService {
  private contract: ethers.Contract;

  constructor(private readonly daoContract: DAOContract, private readonly JSONRPCProvider: RPCProvider) {
    const provider = new ethers.JsonRpcProvider(this.JSONRPCProvider.ALCHEMY_ENDPOINT);
    const wallet = new ethers.Wallet(this.daoContract.signer, provider);
    this.contract = new ethers.Contract(this.daoContract.address, this.daoContract.abi, wallet);
  }
  private async getUserRole(sub: string): Promise<string> {
    try {
      const response = await axios.get(`http://user_management_api:3000/authentication/${sub}`);
      return response.data;
    } catch (error) {
      throw new UnauthorizedException("Role of user not found");;
    }
  }

  private provider(): ethers.JsonRpcProvider {
    const provider = new ethers.JsonRpcProvider(this.JSONRPCProvider.ALCHEMY_ENDPOINT);
    return provider;
  }
  async getBalance(address: string, sub: string): Promise<number> {
    const role = await this.getUserRole(sub);
    console.log(role);
    if (role != 'MFS') {
      throw new UnauthorizedException("User does not have permission");
    }
    const provider = this.provider();
    const balance = await provider.getBalance(address);
    return Number(balance);
  }

  async getProposalThreshold(sub: string): Promise<number> {
    const role = await this.getUserRole(sub);
    console.log(role);
    if (role != 'MFS') {
      throw new UnauthorizedException("User does not have permission");
    }
    return await this.contract.proposalThreshold();
  }

  async getOngoingProposalCount(sub: string): Promise<number> {
    const role = await this.getUserRole(sub);
    console.log(role);
    if (role != 'MFS') {
      throw new UnauthorizedException("User does not have permission");
    }
    return await this.contract.getOngoingProposalsCount();
  }

  async getOngoingProposals(sub: string): Promise<any> {
    const role = await this.getUserRole(sub);
    console.log(role);
    if (role != 'MFS') {
      throw new UnauthorizedException("User does not have permission");
    }
    return await this.contract.getOngoingProposals();
  }

  async registerMember(address: string, _memberURI: string, sub: string): Promise<any> {
    const role = await this.getUserRole(sub);
    console.log(role);
    if (role != 'MFS') {
      throw new UnauthorizedException("User does not have permission");
    }
    return await this.contract.registerMember(address, _memberURI);
  }

  async executeProposal(proposalId: number, sub: string): Promise<any> {
    const role = await this.getUserRole(sub);
    console.log(role);
    if (role != 'MFS') {
      throw new UnauthorizedException("User does not have permission");
    }
    return await this.contract.executeProposal(proposalId);
  }

}
