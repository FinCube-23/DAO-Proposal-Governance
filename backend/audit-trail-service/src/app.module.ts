import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthzModule } from './authz/authz.module';
import { DaoAuditModule } from './dao_audit/dao_audit.module';
import { GraphQLModule } from './graphql/graphql.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),
    DatabaseModule,
    AuthzModule,
    DaoAuditModule,
    GraphQLModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
