import { Module } from '@nestjs/common';
import { MfsBusinessService } from './mfs_business.service';
import { MfsBusinessController } from './mfs_business.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MfsBusiness } from 'src/mfs_business/entities/mfs_business.entity';
import { UsersModule } from 'src/users/users.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
@Module({
  imports: [TypeOrmModule.forFeature([MfsBusiness]), UsersModule,
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
  controllers: [MfsBusinessController],
  providers: [MfsBusinessService]
})
export class MfsBusinessModule { }
