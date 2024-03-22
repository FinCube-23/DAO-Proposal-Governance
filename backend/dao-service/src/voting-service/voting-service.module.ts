import { Module } from '@nestjs/common';
import { VotingServiceService } from './voting-service.service';
import { VotingServiceController } from './voting-service.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VotingServiceEntity } from 'src/voting-service/entities/voting-service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VotingServiceEntity])],
  controllers: [VotingServiceController],
  providers: [VotingServiceService],
})
export class VotingServiceModule {}
