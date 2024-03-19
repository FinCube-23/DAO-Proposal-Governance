import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeUserController } from './exchange_user.controller';
import { ExchangeUserService } from './exchange_user.service';

describe('ExchangeUserController', () => {
  let controller: ExchangeUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExchangeUserController],
      providers: [ExchangeUserService],
    }).compile();

    controller = module.get<ExchangeUserController>(ExchangeUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
