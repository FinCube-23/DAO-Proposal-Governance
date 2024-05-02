import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLController } from './graphql.controller';

describe('GraphqlController', () => {
  let controller: GraphQLController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GraphQLController],
    }).compile();

    controller = module.get<GraphQLController>(GraphQLController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
