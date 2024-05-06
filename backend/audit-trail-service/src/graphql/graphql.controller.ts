import { Controller, Get, Query } from '@nestjs/common';
import { GraphQLService } from './graphql.service';

@Controller('graphql')
export class GraphQLController {
  constructor(private readonly graphqlService: GraphQLService) {}

  @Get('transaction_data')
  async getTransaction(@Query('transactionHash') transactionHash?: string) {
    if (transactionHash) {
      return this.graphqlService.getTransaction(transactionHash);
    } else {
      return 0;
    }
  }
}
