import { Module } from '@nestjs/common';
import { ProposalServiceService } from './proposal-service.service';
import { ProposalServiceController } from './proposal-service.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalEntity } from './entities/proposal.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { WinstonLogger } from 'src/shared/common/logger/winston-logger';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProposalEntity]),
    ClientsModule.register([
      {
        name: 'PROPOSAL_SERVICE', // Injectable
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'proposal-queue', // Routing Key
        },
      },
    ]),
  ],
  controllers: [ProposalServiceController],
  providers: [ProposalServiceService, WinstonLogger],
})
export class ProposalServiceModule {}
