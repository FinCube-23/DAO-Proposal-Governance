import { Module } from '@nestjs/common';
import { DatabaseSeederService } from './database.seeder.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeUserEntity } from 'src/exchange_user/entities/exchange_user.entity';
import { MfsBusinessEntity } from 'src/mfs_business/entities/mfs_business.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExchangeUserEntity]), TypeOrmModule.forFeature([MfsBusinessEntity])],
  providers: [DatabaseSeederService],
  exports: [DatabaseSeederService]
})
export class DatabaseSeederModule { }
