import { Test, TestingModule } from '@nestjs/testing';
import { MfsBusinessService } from './mfs_business.service';

describe('MfsBusinessService', () => {
  let service: MfsBusinessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MfsBusinessService],
    }).compile();

    service = module.get<MfsBusinessService>(MfsBusinessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
