import { Module, forwardRef } from '@nestjs/common';
import { ExchangeUserService } from './exchange_user.service';
import { ExchangeUserController } from './exchange_user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeUserEntity } from 'src/exchange_user/entities/exchange_user.entity';
import { AuthzModule } from 'src/authz/authz.module';

@Module({
  imports: [TypeOrmModule.forFeature([ExchangeUserEntity]), AuthzModule ],
  controllers: [ExchangeUserController],
  providers: [ExchangeUserService]
})
export class ExchangeUserModule { }
