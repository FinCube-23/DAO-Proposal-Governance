import {MiddlewareConsumer, NestModule, Module} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Web3ProxyModule } from './web3-dao-proxy/web3-proxy.module';
import { ConfigModule } from '@nestjs/config';
import { AuthzModule } from './authz/authz.module';
import {WinstonLogger} from './shared/common/logger/winston-logger';
import {MorganMiddleware} from './shared/common/logger/morgan.middleware';
@Module({
  imports: [
    Web3ProxyModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthzModule,
  ],
  controllers: [AppController],
  providers: [AppService, winstonLogger, MorganMiddleware],
  exports: [winstonLogger]
})
export class AppModule implements NestModule {
  // Apply MorganMiddleware globally
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MorganMiddleware).forRoutes('*');
  }
}
