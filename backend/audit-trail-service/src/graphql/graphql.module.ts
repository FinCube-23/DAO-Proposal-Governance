import { Module } from '@nestjs/common';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { GraphQLService } from './graphql.service';
import { GraphQLController } from './graphql.controller';

@Module({
  providers: [
    {
      provide: 'APOLLO_CLIENT',
      useFactory: () => {
        return new ApolloClient({
          uri: 'https://api.studio.thegraph.com/query/67924/fincube-dao/version/latest',
          cache: new InMemoryCache(),
        });
      },
    },
    GraphQLService,
  ],
  exports: ['APOLLO_CLIENT'],
  controllers: [GraphQLController],
})
export class GraphQLModule {}
