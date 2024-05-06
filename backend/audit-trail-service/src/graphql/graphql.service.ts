import { Injectable, Inject } from '@nestjs/common';
import { ApolloClient, gql } from '@apollo/client';

@Injectable()
export class GraphQLService {
  constructor(
    @Inject('APOLLO_CLIENT') private apolloClient: ApolloClient<any>,
  ) {}

  GET_TRANSACTION = gql`
    query MyQuery {
      memberRegistereds(where: { transactionHash: "" }) {
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
