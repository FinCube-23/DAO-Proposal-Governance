import { Module } from '@nestjs/common';
import { ExchangeUserService } from './exchange_user.service';
import { ExchangeUserController } from './exchange_user.controller';

@Module({
  controllers: [ExchangeUserController],
  providers: [ExchangeUserService],
})
export class ExchangeUserModule {}
