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

  GET_MEMBERS_REGISTERED = gql`
    query MyQuery($blockTimestamp_gt: String!) {
      memberRegistereds(where: { blockTimestamp_gt: $blockTimestamp_gt }) {
        transactionHash
        id
        blockTimestamp
        blockNumber
        _newMember
        _memberURI
      }
    }
  `;
  async getMembersRegistered(blockTimestamp_gt: string): Promise<any> {
    try {
      const result = await this.apolloClient.query({
        query: this.GET_MEMBERS_REGISTERED,
        variables: {
          blockTimestamp_gt,
        },
      });
      console.log(result);
      console.log(result.data.memberRegistereds);
      return result.data.memberRegistereds;
    } catch (error) {
      console.error('Error executing GraphQL query:', error);
      throw error;
    }
  }
}
