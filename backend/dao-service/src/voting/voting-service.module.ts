import { Module } from '@nestjs/common';
import { VotingService } from './voting.service';
import { VotingController } from './voting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VotingEntity } from './entities/vote.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VotingEntity])],
  controllers: [VotingController],
  providers: [VotingService],
})
export class VotingServiceModule { }
