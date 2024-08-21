import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MfsBusinessModule } from './mfs_business/mfs_business.module';
import { ExchangeUserModule } from './exchange_user/exchange_user.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthzModule } from './authz/authz.module';
import { DatabaseSeederModule } from './database_seeder/database.seeder.module';
import { DatabaseSeederService } from './database_seeder/database.seeder.service';
@Module({
  imports: [
    MfsBusinessModule,
    ExchangeUserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),
    DatabaseModule,
    AuthzModule,
    DatabaseSeederModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly databaseSeederService: DatabaseSeederService) { }
  async onModuleInit(): Promise<void> {
    await this.databaseSeederService.seed();
  }
}
