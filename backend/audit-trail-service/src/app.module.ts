import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthzModule } from './authz/authz.module';
import { ProposalUpdateModule } from './proposal-update/proposal-update.module';
import { TransactionReceiptModule } from './transaction-receipt/transaction-receipt.module';
import { TasksService } from './background_tasks/tasks.service';
import { TasksModule } from './background_tasks/task.module';
// import { ScheduleModule } from '@nestjs/schedule'; ref: https://github.com/FahimDev/hotel-nft-marketplace/blob/develop/web3-api-service/src/app.module.ts
import { TransactionsModule } from './transactions/transactions.module';
import { WinstonLogger } from './shared/common/logger/winston-logger';
import { MorganMiddleware } from './shared/common/logger/morgan.middleware';
import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import { TraceContextService } from './shared/common/tracing/trace-context.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthzModule,
    ProposalUpdateModule,
    TransactionReceiptModule,
    TasksModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService, TasksService, WinstonLogger, MorganMiddleware, TraceContextService],
  exports: [WinstonLogger],
})
export class AppModule implements NestModule {
  private tracer = trace.getTracer('audit-trail-service', '1.0');

  constructor(
    @Inject(TasksService) private readonly tasksService: TasksService,
  ) {}

  async onModuleInit() {
    // ✅ Top-level initialization span
    const span = this.tracer.startSpan('audit-trail.module.init');

    try {
      await context.with(trace.setSpan(context.active(), span), async () => {
        console.log('Audit Trail Service module initializing...');

        // ✅ This will create child spans - perfect hierarchy!
        await this.tasksService.listenProposalTrx();

        console.log('Audit Trail Service module initialized successfully');
      });

      span.setStatus({ code: SpanStatusCode.OK });
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      console.error('Module initialization failed:', error);
    } finally {
      span.end();
    }
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MorganMiddleware).forRoutes('*');
  }
}
