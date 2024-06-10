import { Module } from '@nestjs/common';
import { VotingService } from './voting.service';
import { VotingController } from './voting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DAOEntity } from 'src/voting/entities/dao.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DAOEntity])],
  controllers: [VotingController],
  providers: [VotingService],
})
export class VotingServiceModule { }
