import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { UsersModule } from '../users/users.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Proposal } from './entities/proposal.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, Proposal]),
    UsersModule,
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
          name: 'user-management-service-queue',
          exchange: 'proposal-update-exchange',
          routingKey: '',
          createQueueIfNotExists: true,
          options: {
            durable: true
          }
        },
      ],
      connectionInitOptions: {
        wait: true,
        timeout: 30000
      },
    })
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService, TypeOrmModule] // Export TypeOrmModule to make repositories available
})
export class OrganizationModule { }
