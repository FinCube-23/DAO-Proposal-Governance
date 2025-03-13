import { Module } from '@nestjs/common';
import { ProposalServiceService } from './proposal-service.service';
import { ProposalServiceController } from './proposal-service.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalEntity } from './entities/proposal.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { WinstonLogger } from 'src/shared/common/logger/winston-logger';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProposalEntity]),
    ClientsModule.register([
      {
        name: 'PROPOSAL_SERVICE', // Injectable
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'pending-proposal-queue', // Routing Key
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
      queues: [
        {
          name: 'dao-service-queue',
          exchange: 'proposal-update-exchange',
          routingKey: '', // Empty for fanout exchanges
          createQueueIfNotExists: true,
          options: {
            durable: true
          }
        },
      ],
      connectionInitOptions: {
        wait: true,
        timeout: 30000, // Increase RabbitMQ connection timeout to 30 seconds
      },

    })
  ],
  controllers: [ProposalServiceController],
  providers: [ProposalServiceService, WinstonLogger],
})
export class ProposalServiceModule { }
