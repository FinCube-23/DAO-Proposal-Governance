import { Test, TestingModule } from '@nestjs/testing';
import { DaoAuditService } from './dao_audit.service';

describe('DaoAuditService', () => {
  let service: DaoAuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DaoAuditService],
    }).compile();

    service = module.get<DaoAuditService>(DaoAuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
