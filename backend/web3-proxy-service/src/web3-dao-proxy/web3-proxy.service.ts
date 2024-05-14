import { Injectable } from '@nestjs/common';
import { DAOContract } from './entities/DAO-contract-entity';
import { RPCProvider } from "./entities/RPC-Provider-entity";
import { ethers } from 'ethers';
@Injectable()
export class Web3ProxyService {
  private contract: ethers.Contract;

  constructor(private readonly daoContract: DAOContract, private readonly JSONRPCProvider: RPCProvider) {
    const provider = new ethers.JsonRpcProvider(this.JSONRPCProvider.ALCHEMY_ENDPOINT);
    const wallet = new ethers.Wallet(this.daoContract.signer, provider);
    this.contract = new ethers.Contract(this.daoContract.address, this.daoContract.abi, wallet);
  }


  private provider(): ethers.JsonRpcProvider {
    const provider = new ethers.JsonRpcProvider(this.JSONRPCProvider.ALCHEMY_ENDPOINT);
    return provider;
  }
  async getBalance(address: string): Promise<number> {
    const provider = this.provider();
    const balance = await provider.getBalance(address);
    return Number(balance);
  }

  async getProposalThreshold(): Promise<number> {
    return await this.contract.proposalThreshold();
  }

  async getOngoingProposalCount(): Promise<number> {
    return await this.contract.getOngoingProposalsCount();
  }

  async getOngoingProposals(): Promise<any> {
    return await this.contract.getOngoingProposals();
  }

  async registerMember(address: string, _memberURI: string): Promise<any> {
    return await this.contract.registerMember(address, _memberURI);
  }

  async executeProposal(proposalId: number): Promise<any> {
    return await this.contract.executeProposal(proposalId);
  }

}
