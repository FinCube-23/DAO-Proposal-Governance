import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeUserService } from './exchange_user.service';

describe('ExchangeUserService', () => {
  let service: ExchangeUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExchangeUserService],
    }).compile();

    service = module.get<ExchangeUserService>(ExchangeUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
