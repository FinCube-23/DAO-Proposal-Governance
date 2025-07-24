import { Module } from '@nestjs/common';
import { DatabaseSeederService } from './database.seeder.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeUser } from 'src/exchange_user/entities/exchange_user.entity';
import { Organization } from 'src/organization/entities/organization.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExchangeUser]), TypeOrmModule.forFeature([Organization])],
  providers: [DatabaseSeederService],
  exports: [DatabaseSeederService]
})
export class DatabaseSeederModule { }
