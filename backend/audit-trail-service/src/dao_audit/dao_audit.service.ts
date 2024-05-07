import { Injectable, Inject } from '@nestjs/common';
import { ApolloClient, gql } from '@apollo/client';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DaoAudit } from './entities/dao_audit.entity';
@Injectable()
export class DaoAuditService {
  constructor(
    @InjectRepository(DaoAudit)
    private daoAuditRepository: Repository<DaoAudit>,
    @Inject('APOLLO_CLIENT') private apolloClient: ApolloClient<any>,
  ) {}
  create(createDaoAudit: DaoAudit) {
    const new_dao_audit = this.daoAuditRepository.create(createDaoAudit);
    return this.daoAuditRepository.save(new_dao_audit);
  }

  findAll() {
    return this.daoAuditRepository.find();
  }

  findOne(id: number) {
    return this.daoAuditRepository.findOne({ where: { id } });
  }
  GET_TRANSACTION = gql`
    query MyQuery {
      memberRegistereds(where: { blockTimestamp_gt: "" }) {
        transactionHash
        id
        blockNumber
        blockTimestamp
      }
    }
  `;

  async getTransaction(transactionHash: string) {
    const result = await this.apolloClient.query({
      query: this.GET_TRANSACTION,
      variables: { transactionHash },
    });
    return result.data.transaction_data;
  }

  async executeQuery(query: string, variables?: any) {
    const result = await this.apolloClient.query({
      query: gql`
        ${query}
      `,
      variables,
    });
    return result.data;
  }
}
