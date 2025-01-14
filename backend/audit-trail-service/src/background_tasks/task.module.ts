import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { ProposalUpdateModule } from 'src/proposal-update/proposal-update.module';

@Module({
  imports: [TransactionsModule, ProposalUpdateModule],
  providers: [TasksService],
})
export class TasksModule {}