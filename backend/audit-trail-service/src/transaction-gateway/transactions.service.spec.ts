import { Test, TestingModule } from '@nestjs/testing';
import { TransactionGatewayService } from './transaction-gateway.service';

describe('TransactionGatewayService', () => {
  let service: TransactionGatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionGatewayService],
    }).compile();

    service = module.get<TransactionGatewayService>(TransactionGatewayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
