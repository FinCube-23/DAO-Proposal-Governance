import { Module } from '@nestjs/common';
import { ExchangeUserService } from './exchange_user.service';
import { ExchangeUserController } from './exchange_user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeUser } from 'src/exchange_user/entities/exchange_user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExchangeUser]) ],
  controllers: [ExchangeUserController],
  providers: [ExchangeUserService]
})
export class ExchangeUserModule { }
