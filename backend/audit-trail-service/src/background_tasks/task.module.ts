import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { ProposalUpdateModule } from 'src/proposal-update/proposal-update.module';
import { ScheduleModule } from '@nestjs/schedule';
import { WinstonLogger } from 'src/shared/common/logger/winston-logger';

@Module({
  imports: [TransactionsModule, ProposalUpdateModule, ScheduleModule.forRoot()],
  providers: [TasksService, WinstonLogger],
})
export class TasksModule {}
