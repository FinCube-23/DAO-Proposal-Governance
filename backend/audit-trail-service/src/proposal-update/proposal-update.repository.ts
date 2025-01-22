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

    async getProposalsAdded(transactionHash: string): Promise<any> {
        try {
            this.logger.log('Fetching proposal added event data');

            const result = await this.apolloClient.query({
                query: this.proposalAddedQuery(transactionHash),
            });
            this.logger.log('added proposals =>' + JSON.stringify(result));

            return result.data;
        } catch (error) {
            this.logger.error('Error fetching added proposals on-chain event data:', error);
            throw error;
        }
    }

    proposalAddedQuery(transactionHash: string): any {
        const query = gql`
        query MyQuery {
            proposalAddeds( where: {transactionHash: "${transactionHash}"}) {
            id
            proposalType
            proposalId
            blockNumber
            blockTimestamp
            transactionHash
          }
        }
      `;
        return query;
    }

}