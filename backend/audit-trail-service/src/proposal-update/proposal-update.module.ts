import { Module } from '@nestjs/common';
import { ProposalUpdateService } from './proposal-update.service';
import { ProposalUpdateController } from './proposal-update.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { ProposalUpdateRepository } from './proposal-update.repository';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

require('dotenv').config();

@Module({
  controllers: [ProposalUpdateController],
  providers: [
    ProposalUpdateService, ProposalUpdateRepository,
    {
      provide: 'APOLLO_CLIENT1',
      useFactory: () => {
        return new ApolloClient({
          link: new HttpLink({
            uri: process.env.SUBGRAPH_QUERY_ENDPOINT,
            fetch,
          }),
          cache: new InMemoryCache(),
        });
      },
    },
  ],
  imports: [
    TransactionsModule, ClientsModule.register([
      {
        name: 'PROPOSAL_UPDATE_SERVICE', // Injectable
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'proposal-update-queue', // Routing Key
        },
      },
    ]),
    RabbitMQModule.forRoot({
      uri: 'amqp://rabbitmq:5672',
      exchanges: [
        {
          name: 'proposal-update-exchange',
          type: 'fanout',
        },
      ],
      connectionInitOptions: {
        wait: true,
        timeout: 30000, // Increase RabbitMQ connection timeout to 30 seconds
      },
    })],
  exports: ['APOLLO_CLIENT1', ProposalUpdateService],
})
export class ProposalUpdateModule { }
