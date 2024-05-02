import { Injectable, Inject } from '@nestjs/common';
import { ApolloClient, gql } from '@apollo/client';

@Injectable()
export class GraphQLService {
  constructor(
    @Inject('APOLLO_CLIENT') private apolloClient: ApolloClient<any>,
  ) {}

  // const GET_BOOKING_RESOLDS = gql`
  //   query MyQuery {
  //     bookingResolds {
  //       bidding
  //       id
  //       owner
  //       seller
  //       sold
  //       splittable
  //       startingPrice
  //       tokenId
  //       transactionHash
  //     }
  //   }
  // `;
  // any and all queries will be specified here in this format

  // async getBookingResolds() {
  //   const result = await this.apolloClient.query({
  //     query: GET_BOOKING_RESOLDS,
  //   });
  //   return result.data.bookingResolds;
  // }
  // all query returns will be specified here in this format

  // async executeQuery(query: string, variables?: any) {
  //   const result = await this.apolloClient.query({
  //     query: gql`
  //       ${query}
  //     `,
  //     variables,
  //   });
  //   return result.data;
  // }
  // this is just a basic implementation
}
