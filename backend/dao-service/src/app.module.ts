import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProposalServiceModule } from './proposal-service/proposal-service.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthzModule } from './authz/authz.module';
import { WinstonLogger } from './shared/common/logger/winston-logger'


@Module({
  imports: [
    ProposalServiceModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),
    DatabaseModule,
    AuthzModule,
  ],
  controllers: [AppController],
  providers: [AppService, WinstonLogger],
  exports: [WinstonLogger],
})
export class AppModule { }
