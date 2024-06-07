import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthzModule } from './authz/authz.module';
import { DaoAuditModule } from './dao_audit/dao_audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),
    DatabaseModule,
    AuthzModule,
    DaoAuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
