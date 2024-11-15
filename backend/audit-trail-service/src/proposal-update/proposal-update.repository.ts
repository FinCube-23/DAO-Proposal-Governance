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
            this.logger.log('added proposals =>' + result.data.proposalAddeds.proposalType);
            this.logger.log('created proposals =>' + resultCreated.data.proposalCreateds.proposalId);

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

    GET_PROPOSAL_EXECUTED = gql`
    query MyQuery {
        proposalExecuteds(
            where: {transactionHash_in: [
            "0x2f458f83e8845f2eb5721c000c4e2794a2f272bb74e03817a52747d7d0d5345a",
            "0xde4794a12deb8c99c7994055d6b0a4ea92d7e3eb028c17ca8754467374f4437d"
            ]}){
            proposalId
        }
        memberApproveds(
            where: {transactionHash_in: [
            "0x2f458f83e8845f2eb5721c000c4e2794a2f272bb74e03817a52747d7d0d5345a",
            "0xde4794a12deb8c99c7994055d6b0a4ea92d7e3eb028c17ca8754467374f4437d"  
            ]}){
            member
        }
    }
    `;

}