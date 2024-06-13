import { Module } from '@nestjs/common';
import { ProposalUpdateService } from './proposal-update.service';
import { ProposalUpdateController } from './proposal-update.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

@Module({
  controllers: [ProposalUpdateController],
  providers: [
    ProposalUpdateService,
    {
      provide: 'APOLLO_CLIENT1',
      useFactory: () => {
        return new ApolloClient({
          link: new HttpLink({
            uri: 'https://api.studio.thegraph.com/proxy/67924/fcgraph/v0.0.3',
            fetch,
          }),
          cache: new InMemoryCache(),
        });
      },
    },
  ],
  imports: [
    ClientsModule.register([
      {
        name: 'PROPOSAL_UPDATE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'proposal-update-queue',
        },
      },
    ]),
  ],
  exports: ['APOLLO_CLIENT1'],
})
export class ProposalUpdateModule {}
