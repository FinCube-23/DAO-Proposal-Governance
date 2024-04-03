import { Module } from '@nestjs/common';
import { Web3ProxyService } from './web3-proxy.service';
import { Web3ProxyController } from './web3-proxy.controller';
import { DAOContract } from './entities/DAO-contract-entity';
import { RPCProvider } from './entities/RPC-Provider-entity';

@Module({
  controllers: [Web3ProxyController],
  providers: [Web3ProxyService, DAOContract, RPCProvider],
})
export class Web3ProxyModule { }
