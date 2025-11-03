import { Module } from '@nestjs/common';
import { TransactionUpdateService } from './transaction-update.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TransactionGatewayModule } from 'src/transaction-gateway/transaction-gateway.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { WinstonLogger } from 'src/shared/common/logger/winston-logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from 'src/shared/common/entity/transaction.entity';
import { TracingModule } from 'src/shared/common/tracing/tracing.module';
import { TransactionIndexerModule } from 'src/transaction-indexer/transaction-indexer.module';

require('dotenv').config();

@Module({
  providers: [
    TransactionUpdateService,
    WinstonLogger,
  ],
  imports: [
    TransactionIndexerModule,
    TransactionGatewayModule,
    TracingModule,
    TypeOrmModule.forFeature([TransactionEntity]),
    RabbitMQModule.forRoot({
      uri: 'amqp://rabbitmq:5672',
      exchanges: [
        {
          name: 'exchange.web3_event_hub.fanout',
          type: 'fanout',
        },
      ],
      connectionInitOptions: {
        wait: true,
        timeout: 30000, // Increase RabbitMQ connection timeout to 30 seconds
      },
    }),
  ],
  exports: [TransactionUpdateService],
})
export class TransactionUpdateModule {}
