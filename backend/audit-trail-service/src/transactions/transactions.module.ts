import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from './entities/transaction.entity';
import { TransactionsController } from './transactions.controller';
import { WinstonLogger } from 'src/shared/common/logger/winston-logger';
import { TracingModule } from '../shared/common/tracing/tracing.module';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, WinstonLogger],
  imports: [
    TypeOrmModule.forFeature([TransactionEntity]),
    TracingModule 
  ],
  exports: [TransactionsService],
})
export class TransactionsModule {}
