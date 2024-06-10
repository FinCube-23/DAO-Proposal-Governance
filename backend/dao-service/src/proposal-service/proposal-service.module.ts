import { Module } from '@nestjs/common';
import { ProposalServiceService } from './proposal-service.service';
import { ProposalServiceController } from './proposal-service.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalEntity } from './entities/proposal.entity';
@Module({
  imports: [TypeOrmModule.forFeature([ProposalEntity])],
  controllers: [ProposalServiceController],
  providers: [ProposalServiceService],
})
export class ProposalServiceModule { }
