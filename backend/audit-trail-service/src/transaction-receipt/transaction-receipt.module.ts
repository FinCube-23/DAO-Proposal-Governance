import { Module } from '@nestjs/common';
import { TransactionReceiptService } from './transaction-receipt.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

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
  providers: [TransactionReceiptService],
  exports: [TransactionReceiptService],
})
export class TransactionReceiptModule {}
