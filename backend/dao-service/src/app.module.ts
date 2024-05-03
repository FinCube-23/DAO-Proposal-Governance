import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VotingServiceModule } from './voting/voting-service.module';
import { ProposalServiceModule } from './proposal-service/proposal-service.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthzModule } from './authz/authz.module';

@Module({
  imports: [
    VotingServiceModule,
    ProposalServiceModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),
    DatabaseModule,
    AuthzModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
