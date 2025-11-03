import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TransactionGatewayModule } from 'src/transaction-gateway/transaction-gateway.module';
import { TransactionUpdateModule } from 'src/transaction-updater/transaction-update.module';
import { ScheduleModule } from '@nestjs/schedule';
import { WinstonLogger } from 'src/shared/common/logger/winston-logger';
import { TracingModule } from 'src/shared/common/tracing/tracing.module';

@Module({
  imports: [
    TransactionGatewayModule,
    TransactionUpdateModule,
    ScheduleModule.forRoot(),
    TracingModule,
  ],
  providers: [TasksService, WinstonLogger],
})
export class TasksModule {}
