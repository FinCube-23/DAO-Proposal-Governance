import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProposalServiceModule } from './proposal-service/proposal-service.module';
import { TransactionReceiptModule } from './transaction-receipt/transaction-receipt.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthzModule } from './authz/authz.module';
import { WinstonLogger } from './shared/common/logger/winston-logger'
import { MorganMiddleware } from './shared/common/logger/morgan.middleware';

@Module({
  imports: [
    ProposalServiceModule,
    TransactionReceiptModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthzModule,
  ],
  controllers: [AppController],
  providers: [AppService, WinstonLogger, MorganMiddleware],
  exports: [WinstonLogger],
})
export class AppModule implements NestModule {
  // Apply MorganMiddleware globally
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MorganMiddleware)
      .forRoutes('*');           // Apply it to all routes (or specific ones)
  }
}
