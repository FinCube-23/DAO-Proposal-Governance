import { Module } from '@nestjs/common';
import { ProposalUpdateService } from './proposal-update.service';
import { ProposalUpdateController } from './proposal-update.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { ProposalUpdateRepository } from './proposal-update.repository';
import { TransactionsService } from 'src/transactions/transactions.service';
import { TransactionsModule } from 'src/transactions/transactions.module';
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
    ])],
  exports: ['APOLLO_CLIENT1', ProposalUpdateService],
})
export class ProposalUpdateModule { }
