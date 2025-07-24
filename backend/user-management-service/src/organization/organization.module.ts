import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from 'src/organization/entities/organization.entity';
import { UsersModule } from 'src/users/users.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
@Module({
  imports: [TypeOrmModule.forFeature([Organization]), UsersModule,
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
  })],
  controllers: [OrganizationController],
  providers: [OrganizationService]
})
export class OrganizationModule { }
