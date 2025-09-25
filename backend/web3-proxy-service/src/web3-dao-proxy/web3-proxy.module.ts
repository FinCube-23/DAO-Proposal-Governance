import { Module } from '@nestjs/common';
import { Web3ProxyService } from './web3-proxy.service';
import { Web3ProxyController } from './web3-proxy.controller';
import { DAOContract } from './entities/DAO-contract-entity';
import { RPCProvider } from './entities/RPC-Provider-entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { WinstonLogger } from 'src/shared/common/logger/winston-logger';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_MANAGEMENT_SERVICE', // Injectable
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'authorization', // Routing Key
        },
      },
    ]),
  ],
  controllers: [Web3ProxyController],
  providers: [Web3ProxyService, DAOContract, RPCProvider, WinstonLogger],
})
export class Web3ProxyModule { }
