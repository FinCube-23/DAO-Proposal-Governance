import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MfsBusinessModule } from './mfs_business/mfs_business.module';
import { ExchangeUserModule } from './exchange_user/exchange_user.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthzModule } from './authz/authz.module';

@Module({
  imports: [
    MfsBusinessModule,
    ExchangeUserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),
    DatabaseModule,
    AuthzModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
