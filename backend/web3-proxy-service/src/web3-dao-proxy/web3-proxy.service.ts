import { Injectable } from '@nestjs/common';
import { DAOContract } from './entities/DAO-contract-entity';
import { RPCProvider } from "./entities/RPC-Provider-entity";
import { ethers } from 'ethers';
@Injectable()
export class Web3ProxyService {
  constructor(private readonly daoContract: DAOContract, private readonly JSONRPCProvider: RPCProvider) { }
  private provider(): ethers.JsonRpcProvider {
    const provider = new ethers.JsonRpcProvider(this.JSONRPCProvider.ALCHEMY_ENDPOINT);
    return provider;
  }
  async getBalance(address: string): Promise<number> {
    const provider = this.provider();
    const balance = await provider.getBalance(address);
    return Number(balance);
  }
}
