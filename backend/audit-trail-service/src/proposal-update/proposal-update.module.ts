import { Module } from '@nestjs/common';
import { ProposalUpdateService } from './proposal-update.service';
import { ProposalUpdateController } from './proposal-update.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  controllers: [ProposalUpdateController],
  providers: [ProposalUpdateService],
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
})
export class ProposalUpdateModule {}
