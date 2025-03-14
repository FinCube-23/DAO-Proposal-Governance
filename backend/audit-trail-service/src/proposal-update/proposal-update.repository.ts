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
            if (!transactionHash) {
                this.logger.error('Invalid transaction hash: Transaction hash is empty');
                throw new Error('INVALID_TRANSACTION_HASH');
            }

            this.logger.log(`THE GRAPH: Fetching proposal added event data for transaction: ${transactionHash}`);

            const result = await this.apolloClient.query({
                query: this.proposalAddedQuery(transactionHash),
            });

            this.logger.log(`Raw query response: ${JSON.stringify(result)}`);

            const proposals = result.data?.proposalAddeds;

            if (!proposals || proposals.length === 0) {
                this.logger.warn(`No proposals found for transaction hash: ${transactionHash}`);
                throw new Error(`NO_PROPOSAL_EVENT_DATA_FOUND:${transactionHash}`);
            }

            const proposal = proposals[0];
            if (!proposal.proposalId || !proposal.blockNumber || !proposal.transactionHash) {
                this.logger.error('Required proposal data missing', {
                    proposalId: proposal.proposalId,
                    blockNumber: proposal.blockNumber,
                    transactionHash: proposal.transactionHash
                });
                throw new Error('INVALID_PROPOSAL_DATA');
            }

            this.logger.log('Proposal Added event found successfully', {
                proposalId: proposal.proposalId,
                blockNumber: proposal.blockNumber,
                transactionHash: proposal.transactionHash
            });

            return proposal;

        } catch (error) {
            if (error.networkError) {
                this.logger.error(`Network error while fetching proposal for tx: ${transactionHash}`, error.networkError);
                throw new Error(`NETWORK_ERROR:${transactionHash}`);
            }

            if (error.graphQLErrors?.length > 0) {
                this.logger.error(`GraphQL errors while fetching proposal for tx: ${transactionHash}`, error.graphQLErrors);
                throw new Error(`GRAPHQL_ERROR:${transactionHash}`);
            }

            // For our custom errors, add context and rethrow
            if (error.message.includes('NO_PROPOSAL_FOUND') ||
                error.message.includes('INVALID_TRANSACTION_HASH') ||
                error.message.includes('INVALID_PROPOSAL_DATA')) {
                throw error;
            }

            // For any unexpected errors
            this.logger.error(`Unexpected error while fetching proposal for tx: ${transactionHash}`, error);
            throw new Error(`UNEXPECTED_ERROR:${transactionHash}`);
        }
    }


    async getTransactionsUpdated(transactionHashes: string[]): Promise<any> {
        try {
            if (!transactionHashes || transactionHashes.length === 0) {
                this.logger.log('Transaction hash list is empty');
                return;
            }

            transactionHashes = transactionHashes.filter(hash => /^0x[a-fA-F0-9]{64}$/.test(hash));
            if (transactionHashes.length === 0) {
                this.logger.warn('No valid transaction hashes found after filtering.');
                throw new Error('NO_VALID_TRANSACTION_HASHES');
            }

            this.logger.log(`Fetching event data for transactions: ${transactionHashes.join(', ')}`);

            const result = await this.apolloClient.query({
                query: this.transactionUpdateQuery(transactionHashes),
                variables: { transactionHashes },
            });

            this.logger.log(`Raw query response: ${JSON.stringify(result)}`);

            const {
                proposalExecuteds,
                proposalAddeds,
                proposalCreateds,
                proposalCanceleds,
                ownershipTransferreds,
                memberRegistereds,
                memberApproveds,
            } = result.data || {};

            if (!proposalExecuteds && !proposalAddeds && !proposalCreateds && !proposalCanceleds &&
                !ownershipTransferreds && !memberRegistereds && !memberApproveds) {
                this.logger.warn(`No relevant events found for transaction hashes: ${transactionHashes.join(', ')}`);
                throw new Error(`NO_EVENT_DATA_FOUND`);
            }

            const transactionsData = {
                proposalExecuteds: proposalExecuteds || [],
                proposalAddeds: proposalAddeds || [],
                proposalCreateds: proposalCreateds || [],
                proposalCanceleds: proposalCanceleds || [],
                ownershipTransferreds: ownershipTransferreds || [],
                memberRegistereds: memberRegistereds || [],
                memberApproveds: memberApproveds || [],
            };

            this.logger.log('Fetched transaction event data successfully', transactionsData);

            return transactionsData;
        } catch (error) {
            if (error.networkError) {
                this.logger.error(`Network error while fetching transactions`, error.networkError);
                throw new Error(`NETWORK_ERROR`);
            }

            if (error.graphQLErrors?.length > 0) {
                this.logger.error(`GraphQL errors while fetching transactions`, error.graphQLErrors);
                throw new Error(`GRAPHQL_ERROR`);
            }

            if (error.message.includes('NO_EVENT_DATA_FOUND') ||
                error.message.includes('INVALID_TRANSACTION_HASHES')) {
                throw error;
            }

            this.logger.error(`Unexpected error while fetching transactions`, error);
            throw new Error(`UNEXPECTED_ERROR`);
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
            data
            __typename
          }
        }
      `;
        return query;
    }

    //To get transaction updates, this will be updated in the following CARD #242 after cron job completes.
    transactionUpdateQuery(transactionHashes: string[]): any {
        const query = gql`
          query GetTransactionsByHashes($transactionHashes: [String!]!) {
            proposalExecuteds(where: { transactionHash_in: $transactionHashes }) {
              transactionHash
              id
              proposalId
              blockNumber
              blockTimestamp
            }
            proposalAddeds(where: { transactionHash_in: $transactionHashes }) {
              transactionHash
              id
              proposalId
              proposalType
              blockNumber
              blockTimestamp
            }
            proposalCreateds(where: { transactionHash_in: $transactionHashes }) {
              transactionHash
              id
              proposalId
              blockNumber
              blockTimestamp
            }
            proposalCanceleds(where: { transactionHash_in: $transactionHashes }) {
              transactionHash
              id
              proposalId
              blockNumber
              blockTimestamp
            }
            proposalAddeds(where: { transactionHash_in: $transactionHashes }) {
              transactionHash
              id
              blockNumber
              blockTimestamp
            }
            ownershipTransferreds(where: { transactionHash_in: $transactionHashes }) {
              transactionHash
              id
              blockNumber
              blockTimestamp
            }
            memberRegistereds(where: { transactionHash_in: $transactionHashes }) {
              transactionHash
              id
              blockNumber
              blockTimestamp
            }
            memberApproveds(where: { transactionHash_in: $transactionHashes }) {
              transactionHash
              id
              blockNumber
              blockTimestamp
            }
          }
        `;
        return query;
    }


}