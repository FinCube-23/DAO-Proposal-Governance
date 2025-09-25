import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { WinstonLogger } from './shared/common/logger/winston-logger';
import { MorganMiddleware } from './shared/common/logger/morgan.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthzModule,
    ProposalUpdateModule,
    TasksModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService, TasksService, WinstonLogger, MorganMiddleware],
  exports: [WinstonLogger],
})
export class AppModule implements NestModule {
  constructor(
    @Inject(TasksService) private readonly tasksService: TasksService,
  ) {}
  async onModuleInit() {
    // Lifecycle Hooks: Trigger the function when the module initializes
    await this.tasksService.listenProposalTrx();
  }
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MorganMiddleware).forRoutes('*'); // Apply it to all routes (or specific ones)
  }
}
