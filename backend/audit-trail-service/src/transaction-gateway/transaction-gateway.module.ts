import { Module } from '@nestjs/common';
import { TransactionGatewayService } from './transaction-gateway.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from '../shared/common/entity/transaction.entity';
import { TransactionGatewayController } from './transaction-gateway.controller';
import { WinstonLogger } from 'src/shared/common/logger/winston-logger';
import { TracingModule } from '../shared/common/tracing/tracing.module';

@Module({
  controllers: [TransactionGatewayController],
  providers: [TransactionGatewayService, WinstonLogger],
  imports: [TypeOrmModule.forFeature([TransactionEntity]), TracingModule],
  exports: [TransactionGatewayService],
})
export class TransactionGatewayModule {}
