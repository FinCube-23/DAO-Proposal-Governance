import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MfsBusinessModule } from './mfs_business/mfs_business.module';
import { ExchangeUserModule } from './exchange_user/exchange_user.module';

@Module({
  imports: [MfsBusinessModule, ExchangeUserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
