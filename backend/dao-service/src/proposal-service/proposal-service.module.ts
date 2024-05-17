import { Module } from '@nestjs/common';
import { ProposalServiceService } from './proposal-service.service';
import { ProposalServiceController } from './proposal-service.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalEntity } from './entities/proposal.entity';

import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProposalEntity]),
    ClientsModule.register([
      {
        name: 'PROPOSAL_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:3003/'],
          queue: 'proposal-queue',
        },
      },
    ]),
  ],
  controllers: [ProposalServiceController],
  providers: [ProposalServiceService],
})
export class ProposalServiceModule { }
