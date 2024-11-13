import {
    CreatedProposalDto,
} from './dto/proposal-update.dto';
import { ApolloClient, gql } from '@apollo/client';
import {
    Injectable,
    Inject,
    Logger,
} from '@nestjs/common';
import { ClientProxy, Ctx, RmqContext } from '@nestjs/microservices';

@Injectable()
export class ProposalUpdateRepository {
    private readonly logger = new Logger(ProposalUpdateRepository.name);

    constructor(
        @Inject('APOLLO_CLIENT1') private apolloClient: ApolloClient<any>,
    ) {
    }

    async getProposalsAdded(): Promise<any> {
        try {
            this.logger.log('Fetching created proposals');

            const result = await this.apolloClient.query({
                query: this.GET_PROPOSAL_ADDED,
            });
            const resultCreated = await this.apolloClient.query({
                query: this.GET_PROPOSAL_CREATED,
            });
            this.logger.log('added proposals =>' + result.data.proposalAddeds);
            this.logger.log('created proposals =>' + resultCreated.data.proposalCreateds);

            return result.data.proposalCreateds;
        } catch (error) {
            this.logger.error('Error fetching created proposals:', error);
            throw error;
        }
    }

    // GETTING PROPOSAL RELATED EVENTS

    GET_PROPOSAL_ADDED = gql`
    query MyQuery {
        proposalAddeds( where: {transactionHash: "0xe8081d4c644dca8f90a5d4d1e94ba9e1f872248c4403afdf47a5ba1dd1c95553"}) {
        id
        proposalType
        proposalId
        blockNumber
        blockTimestamp
        transactionHash
      }
    }
  `;

    GET_PROPOSAL_CREATED = gql`
    query MyQuery {
        proposalCreateds( 
            where: {transactionHash: "0x9bedc4ae2294b431826aae10e11fd1795e690b7a6b92cc007ae7ca8f6b185c6c"}
        ) {
            id
            proposalId
            blockNumber
            voteStart
            voteEnd
            transactionHash
            description
        }
        }
    `;

}