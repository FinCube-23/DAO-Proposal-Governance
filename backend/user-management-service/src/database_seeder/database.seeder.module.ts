import { Module } from '@nestjs/common';
import { DatabaseSeederService } from './database.seeder.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeUser } from 'src/exchange_user/entities/exchange_user.entity';
import { MfsBusiness } from 'src/mfs_business/entities/mfs_business.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExchangeUser]), TypeOrmModule.forFeature([MfsBusiness])],
  providers: [DatabaseSeederService],
  exports: [DatabaseSeederService]
})
export class DatabaseSeederModule { }
