import { Module } from '@nestjs/common';
import { DaoAuditService } from './dao_audit.service';
import { DaoAuditController } from './dao_audit.controller';
import { DaoAudit } from './entities/dao_audit.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ProposalDto } from './dto/proposal.dto';
@Module({
  controllers: [DaoAuditController],
  providers: [
    DaoAuditService, ProposalDto, 
    {
      provide: 'APOLLO_CLIENT',
      useFactory: () => {
        return new ApolloClient({
          uri: 'https://api.studio.thegraph.com/proxy/67924/fcgraph/v0.0.3',
          cache: new InMemoryCache(),
        });
      },
    },
  ],
  exports: ['APOLLO_CLIENT'],
  imports: [TypeOrmModule.forFeature([DaoAudit])],
})
export class DaoAuditModule {}
