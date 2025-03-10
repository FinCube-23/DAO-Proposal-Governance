import { Inject, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthzModule } from './authz/authz.module';
import { ProposalUpdateModule } from './proposal-update/proposal-update.module';
import { TasksService } from './background_tasks/tasks.service';
import { TasksModule } from './background_tasks/task.module';
// import { ScheduleModule } from '@nestjs/schedule'; ref: https://github.com/FahimDev/hotel-nft-marketplace/blob/develop/web3-api-service/src/app.module.ts
import { TransactionsModule } from './transactions/transactions.module';
import { TransactionEntity } from './transactions/entities/transaction.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),
    DatabaseModule,
    AuthzModule,
    ProposalUpdateModule,
    TasksModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService, TasksService],
})
export class AppModule {
  constructor(@Inject(TasksService) private readonly tasksService: TasksService) { }
  async onModuleInit() {
    // Lifecycle Hooks: Trigger the function when the module initializes
    await this.tasksService.listenProposalTrx();
  }
}
