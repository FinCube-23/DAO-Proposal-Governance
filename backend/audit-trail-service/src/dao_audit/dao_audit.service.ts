import { Injectable, Inject, Scope, Logger } from '@nestjs/common';
import { ApolloClient, gql } from '@apollo/client';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DaoAudit } from './entities/dao_audit.entity';
import { ProposalDto } from './dto/proposal.dto';


@Injectable()
export class DaoAuditService {
  private logger = new Logger(DaoAuditService.name);
  public proposals: ProposalDto[];

  constructor(
    @InjectRepository(DaoAudit)
    private daoAuditRepository: Repository<DaoAudit>,
    @Inject('APOLLO_CLIENT') private apolloClient: ApolloClient<any>,
  ) {
    this.proposals=[];
  }
  create(createDaoAudit: DaoAudit) {
    const new_dao_audit = this.daoAuditRepository.create(createDaoAudit);
    this.logger.log(
      `Creating new DAO audit entry: ${JSON.stringify(new_dao_audit)}`,
    );
    return this.daoAuditRepository.save(new_dao_audit);
  }

  findAll() {
    this.logger.log('Fetching all DAO audit entries');
    return this.daoAuditRepository.find();
  }

  findOne(id: number) {
    this.logger.log(`Fetching DAO audit entry with id: ${id}`);
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
      this.logger.log(
        `Fetching registered members after block timestamp: ${blockTimestamp_gt}`,
      );

      const result = await this.apolloClient.query({
        query: this.GET_MEMBERS_REGISTERED,
        variables: {
          blockTimestamp_gt,
        },
      });
      return result.data.memberRegistereds;
    } catch (error) {
      this.logger.error('Error fetching registered members:', error);
      throw error;
    }
  }

  handleProposalPlaced(proposal: ProposalDto) {
    const new_proposal=new ProposalDto();
    new_proposal.id=proposal.id;
    new_proposal.proposalAddress=proposal.proposalAddress;
    if (new_proposal instanceof ProposalDto) {
      this.logger.log(`Received a new proposal - Address: ${new_proposal.proposalAddress}`);
      this.proposals.push(new_proposal);
    } else {
      this.logger.error('Invalid proposal object received:', proposal);
    }
  }

  getProposals() {
    return this.proposals;
  }

}
