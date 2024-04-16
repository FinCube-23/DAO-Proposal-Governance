import { Test, TestingModule } from '@nestjs/testing';
import { DaoAuditController } from './dao_audit.controller';
import { DaoAuditService } from './dao_audit.service';

describe('DaoAuditController', () => {
  let controller: DaoAuditController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DaoAuditController],
      providers: [DaoAuditService],
    }).compile();

    controller = module.get<DaoAuditController>(DaoAuditController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
