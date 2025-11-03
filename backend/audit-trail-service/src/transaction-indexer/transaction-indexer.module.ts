import { Module } from '@nestjs/common';
import { TransactionIndexerService } from './transaction-indexer.service';
import { TransactionIndexerRepository } from './transaction-indexer.repository';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { WinstonLogger } from 'src/shared/common/logger/winston-logger';


@Module({
  imports: [
    RabbitMQModule.forRoot({
      uri: 'amqp://rabbitmq:5672',
      exchanges: [
        {
          name: 'exchange.transaction-receipt.fanout',
          type: 'fanout',
        },
      ],
      queues: [
        {
          name: 'audit-trail-transaction-receipt-queue',
          exchange: 'exchange.transaction-receipt.fanout',
          routingKey: '', // Empty for fanout exchanges
          createQueueIfNotExists: true,
          options: {
            durable: true,
          },
        },
      ],
      connectionInitOptions: {
        wait: true,
        timeout: 30000, // Increase RabbitMQ connection timeout to 30 seconds
      },
    }),
  ],
  providers: [
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
    
    TransactionIndexerService, TransactionIndexerRepository, WinstonLogger],
  exports: ['APOLLO_CLIENT1', TransactionIndexerService, TransactionIndexerRepository],
})
export class TransactionIndexerModule {}
